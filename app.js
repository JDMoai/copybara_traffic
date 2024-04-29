// app.js
document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([37.5665, 126.9780], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 버스 정류장 데이터를 가져와서 지도에 표시하는 코드 작성

    // 검색 기능 구현
    var searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', function() {
        var searchInput = document.getElementById('search-input');
        var searchTerm = searchInput.value;

        // 검색어를 이용하여 버스 정류장을 검색하고 결과를 표시하는 코드 작성
    });

    // 버스 정류장 목록을 표시하는 코드 작성
});