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

function procesirajVnosUporabnika(klepetApp, socket) {
  var sporocilo = $('#poslji-sporocilo').val();
  sporocilo = dodajSmeske(sporocilo);
  var sistemskoSporocilo;

  if (sporocilo.charAt(0) == '/') {
    sistemskoSporocilo = klepetApp.procesirajUkaz(sporocilo);
    if (sistemskoSporocilo) {
      $('#sporocila').append(divElementHtmlTekst(sistemskoSporocilo));
    }
  } else {
    sporocilo = filtirirajVulgarneBesede(sporocilo);
    klepetApp.posljiSporocilo(trenutniKanal, sporocilo);
    $('#sporocila').append(divElementEnostavniTekst(sporocilo));
    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
  }
  //implementacije slike
   var img;
  var spr = sporocilo;
  var koncnice = ['.jpg', '.png', '.gif'];
  var zacetnice = ['http:/', 'https:/'];
  while (spr.indexOf('http')>-1) {
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
      } else {
        break;
      }
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

  socket.on('sporocilo', function (sporocilo) {
    var novElement = divElementEnostavniTekst(sporocilo.besedilo);
    $('#sporocila').append(novElement);
    
    var img;
  var spr = sporocilo.besedilo;
  var koncnice = ['.jpg', '.png', '.gif'];
  var zacetnice = ['http:/', 'https:/'];
  while (spr.indexOf('http')>-1) {
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
      } else {
        break;
      }
    }
  }
    /*if (spr.indexOf('http:/')>-1) {
      if (spr.indexOf('.jpg')>-1) {
        img = spr.substring(spr.indexOf('http:/'),spr.indexOf('.jpg')+4);
        $('#sporocila').append(divElementSlika(img));
        spr = spr.substring(spr.indexOf('.jpg')+4, spr.length);
        slika = true;
        //sporocilo = img;
      } else if (spr.indexOf('.gif')>-1) {
        img = spr.substring(spr.indexOf('http:/'),spr.indexOf('.gif')+4);
        $('#sporocila').append(divElementSlika(img));
        slika = true;
        spr = spr.substring(spr.indexOf('.gif')+4, spr.length);
        //sporocilo = img;
      } else if (spr.indexOf('.png')>-1) {
        img = spr.substring(spr.indexOf('http:/'),sr.indexOf('.png')+4);
        $('#sporocila').append(divElementSlika(img));
        slika = true;
        spr = spr.substring(spr.indexOf('.png')+4, spr.length);
        //sporocilo = img;
      } 
    } else if (spr.indexOf('https:/')>-1){
      if (spr.indexOf('.jpg')>-1) {
        img = spr.substring(spr.indexOf('http:/'),spr.indexOf('.jpg')+4);
        $('#sporocila').append(divElementSlika(img));
        spr = spr.substring(spr.indexOf('.jpg')+4, spr.length);
        slika = true;
        //sporocilo = img;
      } else if (spr.indexOf('.gif')>-1) {
        img = spr.substring(spr.indexOf('http:/'),spr.indexOf('.gif')+4);
        $('#sporocila').append(divElementSlika(img));
        slika = true;
        spr = spr.substring(spr.indexOf('.gif')+4, spr.length);
        //sporocilo = img;commit
      } else if (spr.indexOf('.png')>-1) {
        img = spr.substring(spr.indexOf('http:/'),spr.indexOf('.png')+4);
        spr = spr.substring(spr.indexOf('.png')+4, spr.length);
        slika = true;
        $('#sporocila').append(divElementSlika(img));
        //sporocilo = img;
      } 
    } else {
      break;
    }
  }*/
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
