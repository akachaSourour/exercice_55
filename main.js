var dataPlayers;
var title;
var url = 'http://cdn.55labs.com/demo/api.json';
var maxBar = 0;
var nbBars = 0;
var widthBars = 0;
var svgHeight = 500;
var svgWidth = 1200;

//get json object
async function getPlayers() {
  try {
    let res = await fetch(url);
    return await res.json();
  } catch (error) {
    console.log(error);
  }
}

// generate color to use in bars
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


async function renderPlayers() {
  //construct the object
  let players = await getPlayers();
  let dates = players.data.DAILY.dates.filter(x => !!x).map(u => {return u ? u.replace(/(\d{4})(\d{2})(\d{2})/, "$3/$2/$1") : ''});
  const arr = Object.keys(players.settings.dictionary)
    .filter(v => players.settings.dictionary[v] != null)
    .map(key => ({['name']: key}));
  dataPlayers = {
    labels: dates,
    datasets: []
  };
  for (var j = 0; j < arr.length; j++) {
    var name = arr[j].name;
    var element = {
      label: arr[j].name,
      data: players.data.DAILY.dataByMember.players[name].points.filter(x => !!x),
      completeName: players.settings.dictionary[name].firstname + ' ' + players.settings.dictionary[name].lastname
    }
    dataPlayers.datasets.push(element);
    //get max height of bars
    if(maxBar < Math.max(...players.data.DAILY.dataByMember.players[name].points)){
      maxBar = Math.max(...players.data.DAILY.dataByMember.players[name].points);
    }
  }
  //get number of bars
  nbBars = arr.length * dates.length;

  //get width of bars
  widthBars = Math.floor(svgWidth/(nbBars + (nbBars/arr.length)));

  //set title
  title = players.settings.label;
  document.getElementById('title').innerHTML = title;

  //propotional points
  for (let i = 0; i < dataPlayers.datasets.length; i++) {
    for (j = 0; j < dataPlayers.labels.length; j++) {
      if (dataPlayers.datasets[i].data[j] != null){
        dataPlayers.datasets[i].data[j] = (Math.floor((dataPlayers.datasets[i].data[j]*svgHeight)/maxBar));
      }
    }
  }

  // draw charts
  var x = [];
  html = '';
  for (i = 0; i < dataPlayers.datasets.length; i++) {
    var name = dataPlayers.datasets[i].label;
    x[i] = i * widthBars;
    let color = getRandomColor();
    for (j = 0; j < dataPlayers.labels.length; j++) {
      console.log(dataPlayers.datasets[i].label)
      if (dataPlayers.datasets[i].data[j] != null){
        html += '<rect id="demo'+j+i+'"  onclick="playerDetails(this,'+j+','+i+')" ' +
          'x="' + x[i] + '" y="' + (svgHeight - dataPlayers.datasets[i].data[j]) + '" ' +
          'width="'+widthBars+'" height="' + dataPlayers.datasets[i].data[j] + '" style="fill: ' +color+'"> ' +
          '</rect> ';
        x[i] += widthBars*(2*arr.length - 1);
      } else {
        html += '<rect onclick="playerDetails(this,0,0)"  x="' + x[i] + '" y="' + svgHeight  + '" width="'+widthBars+'" height="' + 0 + ' " />' ;
        x[i] += widthBars*(2*arr.length - 1);
      }
    }
    document.getElementById('graph1').innerHTML = html;
  }

  // set values in y axe
  var yValues = 0;
  while(yValues < maxBar){
    yValues +=100;
    html += '<text fill="black" x="'+ svgWidth +'" y="'+ (svgHeight - Math.floor((yValues*svgHeight)/maxBar))+'">'+ yValues  +'</text>'
  }
  document.getElementById('graph1').innerHTML = html;

  //set dates in x axe
  var x1 = widthBars;
  for (j = 0; j < dataPlayers.labels.length; j++) {
  html += '<text style=" writing-mode: vertical-rl;" fill="black" x="'+ x1 +'" y=\'510\'>'+ dataPlayers.labels[j]+'</text></g>'
    x1 += widthBars*(2*arr.length - 1);
  }
  document.getElementById('graph1').innerHTML = html;
  getDataFromUrl();
}


//set query params
function playerDetails(x,y,z) {
  var key = dataPlayers.datasets[z].label;
  window.location.search = 'name=' + key + '&indexLabel='+ z + '&indexPoint=' + y;
}


//get params and display data in front
function getDataFromUrl(){
  let queryParams = window.location.search;
  if(queryParams.length>0){
    let indexLabel = queryParams.search('indexLabel=');
    let indexPoint = queryParams.search('&indexPoint=');
    let z = queryParams.substr(indexLabel+11,indexPoint-(indexLabel+11));
    let y =queryParams.substr(indexPoint+12,queryParams.length - (indexPoint+12));
    var playerName = dataPlayers.datasets[z].completeName;
    var date = dataPlayers.labels[y];
    var point = dataPlayers.datasets[z].data[y];
    document.getElementById('player').innerHTML ='Name: '+ playerName + ' <br> Date: ' + date + ' <br> Point: ' + point;
    document.getElementById('demo'+y+z).style.fill = "red";
  }
}


renderPlayers();
