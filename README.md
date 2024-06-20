<div align="center">
<h2>🚍안산 버스정보 조회 사이트 제작🚍</h2>
공공데이터포털을 이용해 안산 버스정보를 조회하는 사이트를 제작하였습니다.<BR> 서울에서 안산으로 이사가고 버스를 주로 이용하였지만 <br>아직 잘 모르는 안산버스정보에 호기심이 생겨 제작하게 되었습니다.✨

</div>

## 목차
  - [개요](#개요) 
  - [주요기능 이미지 및 설명](#주요기능-이미지-및-설명)
  - [느낀점 및 배운점](#느낀점-및-배운점)


## 개요
- 프로젝트 이름: 안산 버스정보 조회 사이트
- 프로젝트 기간: 2024.04-2022.05
- 개발 툴: Spring, Java, Jsp ,,,
- 멤버: 장동길, 강지수, 조보근, 김선경, 김성민, 김경태
- 담당: 퀵견적

## 주요기능 이미지 및 설명
|메인|평수|상품선택|추가질문|
|---|---|---|---|
|![main](https://github.com/JDMoai/interiorbara/assets/158019215/599d5e68-92ec-44a2-abf2-137286db7b39)|![size](https://github.com/JDMoai/interiorbara/assets/158019215/8cb929dc-c342-4435-a849-6ab018978f51)|![product](https://github.com/JDMoai/interiorbara/assets/158019215/e889d285-7a12-4e20-b9ff-92f69dd63fd1)|![Question](https://github.com/JDMoai/interiorbara/assets/158019215/9c22a460-6498-4013-aa48-6779f83d065b)|
|메인창(서비스선택 기능)|평수 사이즈선택 기능|상품 선택 기능|주소API,추가내용 데이터수집|

|고객정보|견적완료|내 견적게시판|
|---|---|---|
|![info](https://github.com/JDMoai/interiorbara/assets/158019215/b7be0977-2cb1-4a36-b2a9-71c0ca6e0edb)|![complete](https://github.com/JDMoai/interiorbara/assets/158019215/699d91e4-93de-4d69-84c3-dc84abfce94b)|![board](https://github.com/JDMoai/interiorbara/assets/158019215/6ebeb6bb-e54a-4d54-8602-3705f5216388)|
|고객정보 데이터수집|견적완료 창(입력한 모든내용)|견적완료 창을 게시판으로 확인|

<h4>주요기능</h4>

- 메인페이지에 모달창을 사용함으로써 견적에 집중할 수 있고 빠르고 편리하게 견적을 마칠 수 있도록 만들었습니다.
- 서비스 타입별로 버튼을 누르면 새로 데이터가 들어오게 만들었습니다.
- 상품옵션을 체크하면 우측 사이드에 실시간으로 업데이트 되도록 만들었습니다.
- 다음 모달페이지로 넘어 갈 때 마다 동작애니메이션을 넣어주어 부드럽게 보이도록 하였습니다.
- 웹 창크기를 고려해 창이 줄어들면 양쪽 사이드가 줄어듬과 같이 요약버튼을 만들어 볼 수 있도록 하였습니다.
- 고객 정보 입력창에 형식체크를 넣었습니다.
- 상품선택 및 고객정보를 데이터베이스에 넣고 가져올 수 있게 하였습니다.
- 견적번호를 중복없이 랜덤생성 되도록 만들었고, 견적 완료창과 게시판에 수집한 데이터를 보이게 하였습니다.

## 느낀점 및 배운점
처음 프로젝트를 시작하고 수많은 난관에 부딪혔습니다.<br>

예를 들면 내가 맡은 기능 중 메인 페이지에 모달창을 띄우고 그 모달창만으로 인테리어 견적을 해야 했는데 <br>

처음 시작할 때 bootstrap을 이용하면 될 줄 알았지만 생각대로 되지 않았고 <br>

결국 수많은 검색 끝에 jsp include를 이용해 모달창 여러 개를 자연스럽게 연결 시킬 수 있었습니다. <br>

또 DB에 저장한 내용을 가져오기 위해 Ajax에 HTML요소를 클래스에 직접 넣어 생성하는 것도 생각보다 쉽지 않았던 것 같습니다.<br>

하지만 포기하지 않고 팀원과 함께 문제들을 해결해 나갔고 <br>

그 결과, 프로젝트를 성공적으로 마무리 할 수 있었습니다.<br>

물론 혼자 모두 해결하면 좋겠지만 이렇게 팀원들과 조율하고 의논해서<br>

문제를 빠르게 해결할 수 있다는 걸 느꼈고 피드백의 중요성을 알게 되었습니다.<br>

또한 꽉 막혀 있던 문제가 풀렸을 때 그 희열을 잊지 못할 것 같습니다!


