from flask import Flask, render_template, request
import cx_Oracle

app = Flask(__name__)

# Oracle 데이터베이스 연결 정보
oracle_dsn = cx_Oracle.makedsn("localhost", "1521", sid="XE")
oracle_conn = cx_Oracle.connect(user="IBARA", password="123456", dsn=oracle_dsn)

# Oracle 데이터베이스에서 데이터를 가져오는 함수
def get_data_from_oracle(query, params=None):
    cursor = oracle_conn.cursor()
    cursor.execute(query, params or {})
    data = cursor.fetchall()
    cursor.close()
    return data

# 게시판 목록 페이지
@app.route('/news')
def news():
    # 페이지 번호를 쿼리 파라미터로 받음, 기본값은 1
    page = request.args.get('page', 1, type=int)
    per_page = 5
    offset = (page - 1) * per_page
    
    cursor = oracle_conn.cursor()
    count_query = "SELECT COUNT(*) FROM board"
    cursor.execute(count_query)
    total_posts = cursor.fetchone()[0]
    
    query = """
    SELECT id, title, created_at, views 
    FROM (
        SELECT id, title, created_at, views, ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rnum 
        FROM board
    ) 
    WHERE rnum > :offset AND rnum <= :offset + :per_page
    """
    cursor.execute(query, {'offset': offset, 'per_page': per_page})
    results = cursor.fetchall()
    cursor.close()
    
    total_pages = (total_posts + per_page - 1) // per_page
    
    return render_template('news.html', boards=results, page=page, total_pages=total_pages)

# 글내용
@app.route('/news/<int:notice_id>')
def notice_detail(notice_id):
    cursor = oracle_conn.cursor()

    # 조회수 증가 쿼리
    update_query = "UPDATE board SET views = views + 1 WHERE id = :id"
    cursor.execute(update_query, [notice_id])
    oracle_conn.commit()  # 변경 사항 커밋
    
    # 공지사항 상세 정보 조회 쿼리
    select_query = "SELECT id, title, content, created_at, views FROM board WHERE id = :id"
    cursor.execute(select_query, [notice_id])
    notice = cursor.fetchone()
    cursor.close()
    if notice is None:
        return "Notice not found", 404
    
    return render_template('notice_detail.html', notice=notice)

# Authorized Routes 페이지
@app.route('/authorized_routes')
def authorized_routes():
    query = "SELECT * FROM authorized_routes"
    data = get_data_from_oracle(query)
    return render_template('authorized_routes.html', data=data)

# Transit Routes 페이지
@app.route('/transit_routes')
def transit_routes():
    query = "SELECT * FROM transit_routes"
    data = get_data_from_oracle(query)
    return render_template('transit_routes.html', data=data)

# Transfer Time Analysis 페이지
@app.route('/transfertime')
def transfer_time_analysis():
    page = request.args.get('page', 1, type=int)
    per_page = 70
    offset = (page - 1) * per_page
    
    count_query = "SELECT COUNT(*) FROM TransferTime"
    total_items = get_data_from_oracle(count_query)[0][0]
    
    query = """
    SELECT 연도, 행정구역, 사용자구분, 일시구분, 정류소ID, 정류소번호, 정류소명, 환승시간 
    FROM (
        SELECT 연도, 행정구역, 사용자구분, 일시구분, 정류소ID, 정류소번호, 정류소명, 환승시간, 
               ROW_NUMBER() OVER (ORDER BY 정류소명) AS rnum 
        FROM TransferTime
    ) 
    WHERE rnum > :offset AND rnum <= :offset + :per_page
    """
    data = get_data_from_oracle(query, {'offset': offset, 'per_page': per_page})
    
    # 데이터 변환
    transfer_time_data = [{
        'year': row[0],
        'region': row[1],
        'userType': row[2],
        'timeType': row[3],
        'stopId': row[4],
        'stopNumber': row[5],
        'stopName': row[6],
        'transferTime': row[7]
    } for row in data]
    
    total_pages = (total_items + per_page - 1) // per_page
    
    return render_template('transfertime.html', transfer_time_data=transfer_time_data, page=page, total_pages=total_pages)

if __name__ == '__main__':
    app.run(debug=True)
