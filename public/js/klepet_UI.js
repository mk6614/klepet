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
  } else {
    var img;
    var slika = false;
    
    if (sporocilo.indexOf('http:/')>-1) {
      if (sporocilo.indexOf('.jpg')>-1) {
        img = sporocilo.substring(sporocilo.indexOf('http:/'),sporocilo.indexOf('.jpg')+4);
        //$('#sporocila').append(divElementSlika(img));
        slika = true;
        //sporocilo = img;
      } else if (sporocilo.indexOf('.gif')>-1) {
        img = sporocilo.substring(sporocilo.indexOf('http:/'),sporocilo.indexOf('.gif')+4);
        //$('#sporocila').append(divElementSlika(img));
        slika = true;
        //sporocilo = img;
      } else if (sporocilo.indexOf('.png')>-1) {
        img = sporocilo.substring(sporocilo.indexOf('http:/'),sporocilo.indexOf('.png')+4);
        //$('#sporocila').append(divElementSlika(img));
        slika = true;
        //sporocilo = img;
      } 
    } else if (sporocilo.indexOf('https:/')>-1){
      if (sporocilo.indexOf('.jpg')>-1) {
        img = sporocilo.substring(sporocilo.indexOf('http:/'),sporocilo.indexOf('.jpg')+4);
        //$('#sporocila').append(divElementSlika(img));
        slika = true;
        //sporocilo = img;
      } else if (sporocilo.indexOf('.gif')>-1) {
        img = sporocilo.substring(sporocilo.indexOf('http:/'),sporocilo.indexOf('.gif')+4);
        //$('#sporocila').append(divElementSlika(img));
        slika = true;
        //sporocilo = img;commit
      } else if (sporocilo.indexOf('.png')>-1) {
        img = sporocilo.substring(sporocilo.indexOf('http:/'),sporocilo.indexOf('.png')+4);

        slika = true;
        //sporocilo = img;
      } 
    }
    //$('#sporocila').append(divElementSlika(str);
    sporocilo = filtirirajVulgarneBesede(sporocilo);
    klepetApp.posljiSporocilo(trenutniKanal, sporocilo);
    $('#sporocila').append(divElementEnostavniTekst(sporocilo));
    $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
    if (slika){
      $('#sporocila').append(divElementSlika(img));
      klepetApp.posljiSporocilo(trenutniKanal, divElementSlika(img));
      $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
    }
    var offset=0;
    while (true) {
      if (offset = sporocilo.indexOf('https://www.youtube.com/watch?v=', offset) > -1) {
        var x = sporocilo.indexOf('=', offset)+1;
        var id = sporocilo.substr(x, 11);
        //alert(id);
        $('#sporocila').append(divElementYoutube(id));
        //klepetApp.posljiSporocilo(trenutniKanal, divElementYoutube(id));
        $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
        sporocilo = sporocilo.substr(x+11, sporocilo.length-x-11);
        //alert(sporocilo);
      }else {
        break;
      }
    }
  }

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
    var spr = sporocilo.besedilo;
    //youtube append
    var offset=0;
    while (true) {
      if (offset = spr.indexOf('https://www.youtube.com/watch?v=', offset) > -1) {
        var x = spr.indexOf('=', offset)+1;
        var id = spr.substr(x, 11);
        alert(id);
        $('#sporocila').append(divElementYoutube(id));
        //klepetApp.posljiSporocilo(trenutniKanal, divElementYoutube(id));
        $('#sporocila').scrollTop($('#sporocila').prop('scrollHeight'));
        spr = spr.substr(x+11, spr.length-x-11);
        //alert(sporocilo);
      }else {
        break;
      }
    }
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
