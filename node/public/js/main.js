/* eslint-env jquery, browser */
$(document).ready(() => {

  $.get("/last_updated", function(data){
      $('#lastupdated').html('Last updated: ' + data)    
  })

  $('#table').DataTable({
      responsive: true,
      ajax: {
          url: '/players_data',
          dataSrc: ''
      },
      columns: [
          {name: "username", data: '_id'},
          {data: 'stats.wins'},
          {data: 'stats.winPerc'},
          {data: 'stats.kdRatio'},
          {data: 'stats.topFive'},
          {data: 'stats.topFivePerc'},
          {data: 'stats.topTen'},
          {data: 'stats.topTenPerc'},
          {data: 'stats.kills'},
          {data: 'stats.killsPerGame'},
          {data: 'stats.gamesPlayed'},
          {data: 'stats.averageScore'}
      ],
      paging: false,

  });

});
