function divElementEnostavniTekst(sporocilo) {
  var jeSmesko = sporocilo.indexOf('http://sandbox.lavbic.net/teaching/OIS/gradivo/') > -1;
  if (jeSmesko) {
    sporocilo = sporocilo.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace('&lt;img', '<img').replace('png\' /&gt;', 'png\' />');
    return $('<div style="font-weight: bold"></div>').html(sporocilo);
  } else {
    return $('<div style="font-weight: bold;"></div>').text(sporocilo);
  }
}

function divElementHtmlTekst(sporocilo) {
  return $('<div></div>').html('<i>' + sporocilo + '</i>');
}

function divElementSlika(slika){
/*var x = document.createElement("IMG");
x.setAttribute("src", slika);
x.setAttribute("width", "200");
x.setAttribute("height", "200");
x.setAttribute("hspace", "20");
return x;*/
return $('<img />',
           {
             src: slika, 
             width: 200,
             height: 200,
             hspace: 20
           });
//http://commons.wikimedia.org/wiki/File:Gy%C3%B6rgy_Ligeti_(1984).jpg
}


function divElementYoutube(id){
  return '<iframe src="https://www.youtube.com/embed/'+id+'" allowfullscreen class="margin"  height="150px" width="200px"></iframe>'
}

function procesirajVnosUporabnika(klepetApp, socket) {
  var sporocilo = $('#poslji-sporocilo').val();
  sporocilo = dodajSmeske(sporocilo);
  var sistemskoSporocilo;
  //dodajanje slike

  if (sporocilo.charAt(0) == '/') {
    sistemskoSporocilo = klepetApp.procesirajUkaz(sporocilo);
    if (sistemskoSporocilo) {
      $('#sporocila').append(divElementHtmlTekst(sistemskoSporocilo));
    }
  }
  sporocilo = filtirirajVulgarneBesede(sporocilo);
  klepetApp.posljiSporocilo(trenutniKanal, sporocilo);
  $('#sporocila').append(divElementEnostavniTekst(sporocilo));
  $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));

  //implementacije slike
  var img;
  var spr = sporocilo;
  var koncnice = ['.jpg', '.png', '.gif'];
  var zacetnice = ['http:/', 'https:/'];
  var slika = true;
  while (slika) {
    slika = false;
    //alert('pipi');
    for (var z=0; z<2; z++){
      if (spr.indexOf(zacetnice[z])>-1){
        //alert('pip' + zacetnice[z]);
        for (var k=0; k<3; k++){
          if (spr.indexOf(koncnice[k])>-1) {
            var str1 = spr.substring(spr.indexOf(zacetnice[z]), spr.indexOf(koncnice[k]));
            //alert(str1);
            if (str1.indexOf(' ')<0){
                //alert(koncnice[k] + (spr.indexOf(koncnice[k]))).toString();
              img = spr.substring(spr.indexOf(zacetnice[z]),spr.indexOf(koncnice[k])+4);
              //alert(img);
              $('#sporocila').append(divElementSlika(img));
              spr = spr.substring(spr.indexOf(koncnice[k])+4, spr.length);
            }
            
          }
        }
      }
    }
    for (var k=0; k<3; k++){
      if (spr.indexOf(koncnice[k])>-1) {
        slika = true;
      }
    }
  }
  var spor = sporocilo;
  var offset = 0;
  while (spor.indexOf('https://www.youtube.com/watch?v=') > -1) {
    //alert('youtube');
    if (offset = spor.indexOf('https://www.youtube.com/watch?v=') > -1) {
      var x = spor.indexOf('=', offset)+1;
      var id = spor.substr(x, 11);
      //alert(id);
      $('#sporocila').append(divElementYoutube(id));
      spor = spor.substr(x+11, spor.length-x-11);
      //alert(sporocilo);
    }else {
      break;
    }
  }

  
  $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
  $('#poslji-sporocilo').val('');
}

var socket = io.connect();
var trenutniVzdevek = "", trenutniKanal = "";

var vulgarneBesede = [];
$.get('/swearWords.txt', function(podatki) {
  vulgarneBesede = podatki.split('\r\n');
});

function filtirirajVulgarneBesede(vhod) {
  for (var i in vulgarneBesede) {
    vhod = vhod.replace(new RegExp('\\b' + vulgarneBesede[i] + '\\b', 'gi'), function() {
      var zamenjava = "";
      for (var j=0; j < vulgarneBesede[i].length; j++)
        zamenjava = zamenjava + "*";
      return zamenjava;
    });
  }
  return vhod;
}

$(document).ready(function() {
  var klepetApp = new Klepet(socket);

  socket.on('vzdevekSpremembaOdgovor', function(rezultat) {
    var sporocilo;
    if (rezultat.uspesno) {
      trenutniVzdevek = rezultat.vzdevek;
      $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
      sporocilo = 'Prijavljen si kot ' + rezultat.vzdevek + '.';
    } else {
      sporocilo = rezultat.sporocilo;
    }
    $('#sporocila').append(divElementHtmlTekst(sporocilo));
  });

  socket.on('pridruzitevOdgovor', function(rezultat) {
    trenutniKanal = rezultat.kanal;
    $('#kanal').text(trenutniVzdevek + " @ " + trenutniKanal);
    $('#sporocila').append(divElementHtmlTekst('Sprememba kanala.'));
  });
//tukaj je prejemnik;
//-------------------------------------------------------------------------------------------------------------------------------------------
  socket.on('sporocilo', function (sporocilo) {
    var novElement = divElementEnostavniTekst(sporocilo.besedilo);
    $('#sporocila').append(novElement);
    //implementacija slik na prejemnikovi strani
    var img;
    var spr = sporocilo.besedilo;
    var koncnice = ['.jpg', '.png', '.gif'];
    var zacetnice = ['http:/', 'https:/'];
    slika = true;
    while (slika) {
      slika = false;
      //alert('pipi');
      for (var z=0; z<2; z++){
        if (spr.indexOf(zacetnice[z])>-1){
          //alert('pip' + zacetnice[z]);
          for (var k=0; k<3; k++){
            if (spr.indexOf(koncnice[k])>-1) {
              var str1 = spr.substring(spr.indexOf(zacetnice[z]), spr.indexOf(koncnice[k]));
              //alert(str1);
              if (str1.indexOf(' ')<0){
                //alert(koncnice[k] + (spr.indexOf(koncnice[k]))).toString();
              img = spr.substring(spr.indexOf(zacetnice[z]),spr.indexOf(koncnice[k])+4);
              //alert(img);
              $('#sporocila').append(divElementSlika(img));
              spr = spr.substring(spr.indexOf(koncnice[k])+4, spr.length);
              }
              
            }
          }
        }
      }
      for (var k=0; k<3; k++){
      if (spr.indexOf(koncnice[k])>-1) {
        slika = true;
      }
    }
    }
  
    var spro = sporocilo.besedilo;
    //youtube append
    var offset = 0;
    while (spro.indexOf('https://www.youtube.com/watch?v=') > -1) {
      //alert('youtube');
      if (offset = spro.indexOf('https://www.youtube.com/watch?v=') > -1) {
        var x = spro.indexOf('=', offset)+1;
        var id = spro.substr(x, 11);
        //alert(id);
        $('#sporocila').append(divElementYoutube(id));
        //klepetApp.posljiSporocilo(trenutniKanal, divElementYoutube(id));
        $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
        spro = spro.substring(x+11, spro.length -1);
        //alert(sporocilo);
      }else {
        break;
      }
    }

    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
  });
  
  socket.on('kanali', function(kanali) {
    $('#seznam-kanalov').empty();

    for(var kanal in kanali) {
      kanal = kanal.substring(1, kanal.length);
      if (kanal != '') {
        $('#seznam-kanalov').append(divElementEnostavniTekst(kanal));
      }
    }

    $('#seznam-kanalov div').click(function() {
      klepetApp.procesirajUkaz('/pridruzitev ' + $(this).text());
      $('#poslji-sporocilo').focus();
    });
    
    
  });
  
  
  

  socket.on('uporabniki', function(uporabniki) {
    $('#seznam-uporabnikov').empty();
    for (var i=0; i < uporabniki.length; i++) {
      $('#seznam-uporabnikov').append(divElementEnostavniTekst(uporabniki[i]));
    }
    //dodajanje funkcije "zasebna"
    $('#seznam-uporabnikov div').click(function() {
      $('#poslji-sporocilo').val('/zasebno \"' + $(this).text()+'\" ');
      $('#poslji-sporocilo').focus();
    });
  });

  setInterval(function() {
    socket.emit('kanali');
    socket.emit('uporabniki', {kanal: trenutniKanal});
  }, 1000);

  $('#poslji-sporocilo').focus();

  $('#poslji-obrazec').submit(function() {
    procesirajVnosUporabnika(klepetApp, socket);
    return false;
  });
  
  
});

function dodajSmeske(vhodnoBesedilo) {
  var preslikovalnaTabela = {
    ";)": "wink.png",
    ":)": "smiley.png",
    "(y)": "like.png",
    ":*": "kiss.png",
    ":(": "sad.png"
  }
  for (var smesko in preslikovalnaTabela) {
    vhodnoBesedilo = vhodnoBesedilo.replace(smesko,
      "<img src='http://sandbox.lavbic.net/teaching/OIS/gradivo/" +
      preslikovalnaTabela[smesko] + "' />");
  }
  return vhodnoBesedilo;
}