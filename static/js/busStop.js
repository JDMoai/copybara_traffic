var mapContainer = document.getElementById('map'),
    mapOption = {
        center: new kakao.maps.LatLng(37.36392, 126.876417),
        level: 3
    };

var map = new kakao.maps.Map(mapContainer, mapOption);
map.addOverlayMapTypeId(kakao.maps.MapTypeId.TRAFFIC);

var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

const API_KEY = '49143c82d672447ea2c055c8ddfb0c21';
let currentInfowindow = null;
let polyline = null;

async function getData() {
    let allBusStops = [];
    let pageIndex = 1;
    let pageSize = 1000;
    let totalFetched = 0;

    while (true) {
        const stationUrl = `https://openapi.gg.go.kr/BusStation?KEY=${API_KEY}&Type=json&pIndex=${pageIndex}&pSize=${pageSize}&SIGUN_NM=안산시&SIGUN_CD=41270`;
        const stationResponse = await fetch(stationUrl);
        const stationData = await stationResponse.json();
        
        if (stationData && stationData.BusStation && stationData.BusStation[1] && stationData.BusStation[1].row) {
            const busStops = stationData.BusStation[1].row;
            allBusStops = allBusStops.concat(busStops);
            totalFetched += busStops.length;

            // 종료 조건: 더 이상 가져올 데이터가 없으면 중단
            if (busStops.length < pageSize) {
                break;
            }

            // 다음 페이지로 이동
            pageIndex++;
        } else {
            console.error("Invalid station API response:", stationData);
            break;
        }
    }

    console.log("Fetched all station data:", allBusStops);
    displayBusStops(allBusStops);
}
getData();

function displayBusStops(busStops) {
    var listEl = document.getElementById('bus-stops-list');
    var headingEl = document.querySelector('#bus-stops-tab .tab-heading');
    headingEl.textContent = `정류소 (${busStops.length})`;

    listEl.innerHTML = ''; 

    for (var i = 0; i < busStops.length; i++) {
        var busStop = busStops[i];

        var itemEl = document.createElement('li');
        itemEl.innerHTML = `${busStop.STATION_NM_INFO} (${busStop.STATION_MANAGE_NO})`;
        listEl.appendChild(itemEl);

        var imageSrc = 'img/정류소.png',
            imageSize = new kakao.maps.Size(25, 25),
            imageOption = {offset: new kakao.maps.Point(27, 35)};

        if (busStop.WGS84_LOGT && busStop.WGS84_LAT) {
            var lat = parseFloat(busStop.WGS84_LAT);
            var lng = parseFloat(busStop.WGS84_LOGT);
            var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption),
                markerPosition = new kakao.maps.LatLng(lat, lng);
            var marker = new kakao.maps.Marker({
                position: markerPosition,
                image: markerImage
            });
            marker.setMap(map);

            // 마커에 클릭 이벤트 추가
            kakao.maps.event.addListener(marker, 'click', makeOverListener(map, marker, busStop));

            // 정류소 목록 아이템에 클릭 이벤트 추가
            itemEl.addEventListener('click', (function(lat, lng, busStop, marker) {
                return function() {
                    var moveLatLon = new kakao.maps.LatLng(lat, lng);
                    map.panTo(moveLatLon);

                    // 이전 정보 창 닫기
                    if (currentInfowindow !== null) {
                        currentInfowindow.close();
                    }

                    // 새로운 정보 창 생성
                    var infowindow = new kakao.maps.InfoWindow();
                    makeOverListener(map, marker, busStop, infowindow)();

                    // 현재 정보 창 업데이트
                    currentInfowindow = infowindow;
                };
            })(lat, lng, busStop, marker));
        }
    }
}

function makeOverListener(map, marker, busStop, infowindow = null) {
    return async function() {
        // Close the previous info window if it exists
        if (currentInfowindow) {
            currentInfowindow.close();
        }

        var stationId = busStop.STATION_ID;
        var arrivalUrl = `http://apis.data.go.kr/6410000/busarrivalservice/getBusArrivalList?serviceKey=TojESCiwu4K25511KqouMShi3ePlswgrDflY6%2B%2FCJtS1wnWOSDdJP0v25yfuF%2B%2FMmoLLdt8k%2BBhJYNie4yUiMg%3D%3D&stationId=${stationId}`;

        try {
            var arrivalResponse = await fetch(arrivalUrl);
            var xmlText = await arrivalResponse.text();
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmlText, "text/xml");
            var busArrivalList = xmlDoc.getElementsByTagName("busArrivalList");

            var listItems = [];
            for (var i = 0; i < busArrivalList.length; i++) {
                var bus = busArrivalList[i];
                var routeId = bus.getElementsByTagName("routeId")[0].textContent;
                var predictTime1 = bus.getElementsByTagName("predictTime1")[0].textContent;
                var locationNo1 = bus.getElementsByTagName("locationNo1")[0].textContent;
                var predictTime2 = bus.getElementsByTagName("predictTime2")[0].textContent;
                var locationNo2 = bus.getElementsByTagName("locationNo2")[0].textContent;

                var routeUrl = `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteInfoItem?serviceKey=TojESCiwu4K25511KqouMShi3ePlswgrDflY6%2B%2FCJtS1wnWOSDdJP0v25yfuF%2B%2FMmoLLdt8k%2BBhJYNie4yUiMg%3D%3D&routeId=${routeId}`;
                var routeResponse = await fetch(routeUrl);
                var routeXmlText = await routeResponse.text();
                var routeXmlDoc = parser.parseFromString(routeXmlText, "text/xml");
                var routeName = routeXmlDoc.getElementsByTagName("routeName")[0].textContent;

                listItems.push(`
                    <tr>
                        <td id="busId" data-route-id="${routeId}">${routeName}</td>
                        <td>
                            ${predictTime1}분 (${locationNo1}전)
                            ${predictTime2 && locationNo2 ? ` , ${predictTime2}분 (${locationNo2}전)` : ' - 도착정보없음'}
                        </td>
                    </tr>
                `);
            }

            var content = `
            <div class="bus-info">
                <h4>${busStop.STATION_NM_INFO}(${busStop.STATION_MANAGE_NO})<button class="close-btn" onclick="closeInfoWindow()">X</button></h4>
                <table>
                    <thead>
                        <tr>
                            <th id="busId">노선번호</th>
                            <th>도착 정보</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${listItems.join('')}
                    </tbody>
                </table>
            </div>
        `;

            if (!infowindow) {
                infowindow = new kakao.maps.InfoWindow();
            }
            infowindow.setContent(content);

            // 지도 중심을 마커 위치로 이동
            map.setCenter(marker.getPosition());

            // 정보 창 위치 조정
            infowindow.setPosition(marker.getPosition());
            infowindow.open(map, marker);

            // Update the current info window reference
            currentInfowindow = infowindow;

            window.closeInfoWindow = function() {
                infowindow.close();
                currentInfowindow = null; // Reset the current info window reference
            };

            // Add event listeners for route clicks
            document.querySelectorAll('#busId').forEach(item => {
                item.addEventListener('click', function() {
                    var routeId = this.dataset.routeId;
                    displayBusRoute(routeId);
                });
            });

        } catch (error) {
            console.error('실시간 버스 정보를 가져오는데 실패했습니다:', error);
        }
    };
}


let startMarker = null;  // 기점 마커를 저장할 변수
let endMarker = null;    // 종점 마커를 저장할 변수
let turnMarker = null;   // 회차 지점 마커를 저장할 변수

function closeInfoWindow() {
    if (currentInfowindow) {
        currentInfowindow.close();
        currentInfowindow = null;
    }
}

async function displayBusRoute(routeId) {
    var routeUrl = `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteLineList?serviceKey=TojESCiwu4K25511KqouMShi3ePlswgrDflY6%2B%2FCJtS1wnWOSDdJP0v25yfuF%2B%2FMmoLLdt8k%2BBhJYNie4yUiMg%3D%3D&routeId=${routeId}`;
    var infoUrl = `http://apis.data.go.kr/6410000/busrouteservice/getBusRouteInfoItem?serviceKey=TojESCiwu4K25511KqouMShi3ePlswgrDflY6%2B%2FCJtS1wnWOSDdJP0v25yfuF%2B%2FMmoLLdt8k%2BBhJYNie4yUiMg%3D%3D&routeId=${routeId}`;
    
    try {
        // Close the info window if it's open
        closeInfoWindow();

        // 노선 경로 정보 가져오기
        var response = await fetch(routeUrl);
        var xmlText = await response.text();
        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(xmlText, "text/xml");
        var routeLineList = xmlDoc.getElementsByTagName("busRouteLineList");

        if (routeLineList.length === 0) {
            console.error("Error: No route line data found in the response.");
            return;
        }

        var linePath = [];
        for (var i = 0; i < routeLineList.length; i++) {
            var lineSeq = routeLineList[i].getElementsByTagName("lineSeq")[0].textContent;
            var x = parseFloat(routeLineList[i].getElementsByTagName("x")[0].textContent);
            var y = parseFloat(routeLineList[i].getElementsByTagName("y")[0].textContent);
            var position = new kakao.maps.LatLng(y, x);
            linePath.push(position);
        }

        // 좌표 데이터를 순서대로 정렬
        linePath.sort((a, b) => parseInt(a.lineSeq) - parseInt(b.lineSeq));

        if (polyline) {
            polyline.setMap(null); // 기존 라인이 있다면 제거
        }

        polyline = new kakao.maps.Polyline({
            path: linePath,
            strokeWeight: 6,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeStyle: 'solid'
        });

        polyline.setMap(map);

        // 기존 기점 마커 제거
        if (startMarker) {
            startMarker.setMap(null);
        }
        // 기존 종점 마커 제거
        if (endMarker) {
            endMarker.setMap(null);
        }
        // 기존 회차 지점 마커 제거
        if (turnMarker) {
            turnMarker.setMap(null);
        }

        // 기점 마커 추가
        startMarker = new kakao.maps.Marker({
            position: linePath[0],
            image: new kakao.maps.MarkerImage(
                'img/busicon.png',  // 기점 아이콘 이미지 경로
                new kakao.maps.Size(36, 37),  // 아이콘 이미지 크기
                {offset: new kakao.maps.Point(18, 37)}  // 아이콘 위치 조정
            )
        });
        startMarker.setMap(map);

        // 종점 마커 추가
        endMarker = new kakao.maps.Marker({
            position: linePath[linePath.length - 1],
            image: new kakao.maps.MarkerImage(
                'img/busicon.png',  // 종점 아이콘 이미지 경로
                new kakao.maps.Size(36, 37),  // 아이콘 이미지 크기
                {offset: new kakao.maps.Point(18, 37)}  // 아이콘 위치 조정
            )
        });
        endMarker.setMap(map);

         // 회차 지점 마커 추가 (예시로 중간 지점을 회차 지점으로 설정)
         const turnPointIndex = Math.floor(linePath.length / 2);
         turnMarker = new kakao.maps.Marker({
             position: linePath[turnPointIndex],
             image: new kakao.maps.MarkerImage(
                 'img/busicon.png',  // 회차 지점 아이콘 이미지 경로
                 new kakao.maps.Size(36, 37),  // 아이콘 이미지 크기
                 {offset: new kakao.maps.Point(18, 37)}  // 아이콘 위치 조정
             )
         });
         turnMarker.setMap(map);

        // 경로를 포함하는 영역을 계산
        var bounds = new kakao.maps.LatLngBounds();
        linePath.forEach(function(latlng) {
            bounds.extend(latlng);
        });

        // 지도를 경로를 포함하는 영역으로 맞춤
        map.setBounds(bounds);

        // 노선 기본 정보 및 배차 정보 가져오기
        var infoResponse = await fetch(infoUrl);
        var infoXmlText = await infoResponse.text();
        var infoXmlDoc = parser.parseFromString(infoXmlText, "text/xml");

        var routeName = infoXmlDoc.getElementsByTagName("routeName")[0].textContent;
        var routeTypeName = infoXmlDoc.getElementsByTagName("routeTypeName")[0].textContent;
        var startStationName = infoXmlDoc.getElementsByTagName("startStationName")[0].textContent;
        var endStationName = infoXmlDoc.getElementsByTagName("endStationName")[0].textContent;
        var companyName = infoXmlDoc.getElementsByTagName("companyName")[0].textContent;
        var companyTel = infoXmlDoc.getElementsByTagName("companyTel")[0].textContent;
        var peekAlloc = infoXmlDoc.getElementsByTagName("peekAlloc")[0].textContent;
        var nPeekAlloc = infoXmlDoc.getElementsByTagName("nPeekAlloc")[0].textContent;
        var upFirstTime = infoXmlDoc.getElementsByTagName("upFirstTime")[0].textContent;
        var upLastTime = infoXmlDoc.getElementsByTagName("upLastTime")[0].textContent;
        var downFirstTime = infoXmlDoc.getElementsByTagName("downFirstTime")[0].textContent;
        var downLastTime = infoXmlDoc.getElementsByTagName("downLastTime")[0].textContent;

        // 모달 창에 정보 표시
        document.getElementById("routeName").textContent = routeName;
        document.getElementById("routeTypeName").textContent = routeTypeName;
        document.getElementById("startStationName").textContent = startStationName;
        document.getElementById("endStationName").textContent = endStationName;
        document.getElementById("companyName").textContent = companyName;
        document.getElementById("companyTel").textContent = companyTel;
        document.getElementById("interval").textContent = `${peekAlloc}~${nPeekAlloc}분`;
        document.getElementById("upFirstLastTime").textContent = `${upFirstTime}~${upLastTime}`;
        document.getElementById("downFirstLastTime").textContent = `${downFirstTime}~${downLastTime}`;

        // 모달 창 표시
        document.getElementById("route-info-modal").style.display = 'block';

    } catch (error) {
        console.error('Error fetching or displaying bus route:', error);
    }
}

// 모달 창 닫기 함수 추가
function closeModalWindow() {
    document.getElementById('route-info-modal').style.display = 'none';
}






// 검색 기능 관련 코드
document.getElementById('search-button').addEventListener('click', function() {
    var searchInput = document.getElementById('search-input');
    var searchTerm = searchInput.value.trim();

    if (searchTerm !== '') {
        searchBusStops(searchTerm);
        searchBusRoutes(searchTerm);
    }
});

document.getElementById('search-input').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // 폼 제출 동작 방지
        document.getElementById('search-button').click(); // 검색 버튼 클릭 트리거
    }
});

function searchBusStops(searchTerm) {
    var listEl = document.getElementById('bus-stops-list');
    var headingEl = document.querySelector('#bus-stops-tab .tab-heading');
    var busStops = Array.from(listEl.getElementsByTagName('li'));
    var visibleStops = busStops.filter(function(busStop) {
        var stationName = busStop.textContent;
        return stationName.includes(searchTerm);
    });

    busStops.forEach(function(busStop) {
        var stationName = busStop.textContent;
        if (stationName.includes(searchTerm)) {
            busStop.style.display = 'block';
        } else {
            busStop.style.display = 'none';
        }
    });

    headingEl.textContent = `정류소 (${visibleStops.length})`;
}

function searchBusRoutes(searchTerm) {
    var listEl = document.getElementById('bus-routes-list');
    var headingEl = document.querySelector('#bus-routes-tab .tab-heading');

    fetch(`http://apis.data.go.kr/6410000/busrouteservice/getBusRouteList?serviceKey=TojESCiwu4K25511KqouMShi3ePlswgrDflY6%2B%2FCJtS1wnWOSDdJP0v25yfuF%2B%2FMmoLLdt8k%2BBhJYNie4yUiMg%3D%3D&keyword=${searchTerm}&numOfRows=1153`)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            const busRouteList = xmlDoc.getElementsByTagName("busRouteList");

            listEl.innerHTML = ''; // 기존 내용 초기화

            for (var i = 0; i < busRouteList.length; i++) {
                var busRoute = busRouteList[i];
                var routeId = busRoute.getElementsByTagName("routeId")[0].textContent;
                var routeTypeName = busRoute.getElementsByTagName("routeTypeName")[0].textContent;
                var routeName = busRoute.getElementsByTagName("routeName")[0].textContent;

                var itemEl = document.createElement('li');
                itemEl.innerHTML = `${routeName} (${routeTypeName})`;
                itemEl.dataset.routeId = routeId; // routeId를 데이터 속성으로 저장
                listEl.appendChild(itemEl);

                itemEl.addEventListener('click', function() {
                    var routeId = this.dataset.routeId;
                    displayBusRoute(routeId);
                });
            }

            headingEl.textContent = `버스 (${busRouteList.length})`;
        })
        .catch(error => {
            console.error('버스 노선 정보를 가져오는데 실패했습니다:', error);
        });
}
