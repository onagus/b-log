//**---- Global Variables ----**
var tsGlobal = {
  clientID : '205386660424-hpvu0tsskcfe0f4i3eu9okhvc8fq90ic.apps.googleusercontent.com',
  clientSecret : 'OQKuKK900cn7d4BqRKZHz9dV',
  loginData : {},
  loginSecret : {
      toshi : 'password',
      admin : 'admin'
  },
  date : "",
  postArticle : {},
  readArticle : []
};  

var tsHtml = {
  divArticle : function(){
    this.el = '<div class="article">' +
                  '<h2><%= title %></h2>' + 
                  '<hr />' + 
                  '<h4>Posted by : <%= author %></h4>' + 
                  '<h4><%= date %></h4>' + 
                  '<p><%= body %></p>' + 
                  '<img class="article-img" src="<%= image %>"/>' +
                  '<i class="fa fa-thumbs-up" aria-hidden="true"></i>' +
                  '<a href="<%= url %>" target="_blank"><p><%= url %></p></a>' +
              '</div>'; 
  },
  htmlTable : function(){
    this.open = '<table style="width:100%">' +
                  '<tr>' +
                    '<th>Title</th>' +
                    '<th>Body</th>' +
                    '<th>Date</th>' + 
                    '<th>URL</th>' + 
                    '<th>Image</th>' +
                    '<th>Author</th>' + 
                    '<th>Edit</th>' +
                  '</tr>';
    this.close = '</table>';
    this.inputs = function(obj){
      return '<tr>' +
                    '<td><input id="' + i + '" name="title" value="' + obj.title + '"/></td>' +
                    '<td><textarea id="' + i + '" name="body">' + obj.body + '</textarea></td>' +
                    '<td><input id="' + i + '" name="date" value="' + obj.date + '"/></td>' +
                    '<td><input id="' + i + '" name="url" value="' + obj.url + '"/></td>' +
                    '<td><input id="' + i + '" name="image" value="' + obj.image + '"/></td>' +
                    '<td><input id="' + i + '" name="author" value="' + obj.author + '"/></td>' +
                    '<td><button index="' + i + '" class="update">Update</button><button index="' + i + '" class="delete">Delete</button></td>' +
                 '</tr>'; 
    }
  } 
};
 
tsHtml.divArticle.prototype.rtn = function(){
  return this.el; 
};
tsHtml.htmlTable.prototype.opener = function(){
  return this.open;
}
tsHtml.htmlTable.prototype.closer = function(){
  return this.close;
}
tsHtml.htmlTable.prototype.rtn = function(obj){
  return this.inputs(obj);
}
   
//**---- Global Functions ----** 
var tsFunction = {
  init : function(){ 
    //Init article container to empty
    $('#mainContainer').empty();
    //Resets readArticle 
    tsGlobal.readArticle = [];
    //Init Firebase
    fireBase.read();   
    //Init submit button
    $('#submit-button').on('click', function(){
      //Init login Data to empty
      tsGlobal.loginData = {};
      //Go thru each input field and extract prop, value
      //Run login confirmation function
      $(':input').each(function(i, data){
          var thisObj = $(this);
          var key = thisObj.attr('name');
          var value = thisObj.val();   
          tsGlobal.loginData[key] = value;   
          tsFunction.loginData();
      }); 
      $('#login-info').empty();
      //Render the article edit tables onto the edit window
      tsFunction.renderEdit();
    });  

    //Init submit article button
    $('#submit-article').on('click', function(e){
      /*THIS WAS RUNNING TWICE*/
      e.stopImmediatePropagation();   
      tsGlobal.postArticle = {};
      $('.login-inputs').each(function(i, data){
        var thisObj = $(this);
        var key = thisObj.attr('name');
        var value = thisObj.val();    
        tsGlobal.postArticle[key] = value;   
        tsGlobal.postArticle['date'] = moment().format("MMM Do YYYY");
        tsGlobal.postArticle['author'] = tsGlobal.loginData.username; 
      });
      fireBase.push(tsGlobal.postArticle);
    });

    //Init login button
    $('#login').on('click', function(){ 
      $('#popUp').css({
        "display" : "block",
        "z-index" : 100
      });
    });  

    //Init close window button
    $('#closeBox h2').on('click', function(){ 
      $('#popUp').css({
        "display" : "none",
        "z-index" : 0
      });
      $('#popUp2').css({
        "display" : "none",
        "z-index" : 0
      }); 
      window.location.reload();
    }); 

    $('.update').on('click', function(){
      var button = $(this);
      var id = button.attr('index');
      var thisArticle = tsGlobal.readArticle[id];
      $(":input").filter("#" + id).each(function(i, el){ 
        var key = thisArticle.key;
        var thisObj = $(this);
        var prop = thisObj.attr('name');
        var value = thisObj.val(); 
        thisArticle[prop] = value;
        fireBase.update(key, thisArticle);
      });
      alert("Updated Firebase");
    });

    $('.delete').on('click', function(){
      var button = $(this);
      var id = button.attr('index');
      var key = tsGlobal.readArticle[id].key;
      alert("deleted " + key); 
      fireBase.delete(key);   
    });
  },

  //Renders readArticle contents onto main page
  renderMain : function(){
     for (i=0; i<tsGlobal.readArticle.length; i++){
          var divArticle = new tsHtml.divArticle();
          var thisModel = tsGlobal.readArticle[i];  
          var template =  _.template(divArticle.rtn()); 
          var thisDiv = $('<div>').html(template(thisModel));
          $('#mainContainer').append(thisDiv); 
      }  
  },
  //Renders readArticle contents with edit and delete buttons onto popUp2 edit window
  renderEdit : function(){
      $('#login-info-3').empty();
      var tableHtml = new tsHtml.htmlTable();
      var tableOpen = tableHtml.opener();
      var tableClose = tableHtml.closer();
      //var template = _.template(tableOpen + tableClose);  
      for(i=0; i<tsGlobal.readArticle.length; i++){ 
        //New instance of htmlTable object
        var row = new tsHtml.htmlTable();
        var thisArticle = tsGlobal.readArticle[i]; 
        //Call the rtn prototype and pass thisArticle object
        tableOpen += row.rtn(thisArticle);
      }
      var thisEl = $('<div>').html(tableOpen + tableClose);
      $('#login-info-3').append(thisEl);
      //Reset button queue
      tsFunction.init();
  },
  //Captures data from login input fields 
  loginData : function() {
    
    $.ajax({
        type: 'POST',
        url: 'login.php',
        data: tsGlobal.loginData,
        success: function(response){
            if (response === true) {
                alert('Truey!');
            } 
            else {
                alert('Falsey!');
            }
        },
        error: function(xhr){
            console.log(xhr);
        }
    });
    
    var key = tsGlobal.loginData.username;
    var value = tsGlobal.loginData.password;
    if (tsGlobal.loginSecret[key] === value){ 
       $('#popUp').css({
         "display" : "none",
         "z-index" : 0
        });
       $('#popUp2').css({
        "display" : "block",
        "z-index" : 100
        });  
    } 
  }
};

//**---- Firebase connection ----**
var myBlog = new Firebase("https://toshiapp.firebaseio.com/");
var articleCollection = myBlog.child('articles');
//Firebase CRUD methods 
var fireBase = {
  //Push new article entry onto firebase
  push : function(obj){
    articleCollection.push(obj);
  },
  //Read from Firebase and save data into readArticle arrary
  read : function(){ 
    articleCollection.on('value', function(results){ 
      results.forEach(function(item){   
            var thisObj = {};
            thisObj.title = item.val().title;
            thisObj.image = item.val().image;
            thisObj.url = item.val().url;
            thisObj.body = item.val().body;
            thisObj.key = item.key(); 
            thisObj.date = item.val().date;
            thisObj.author = item.val().author;
            tsGlobal.readArticle.push(thisObj); 
      });  
     tsFunction.renderMain();
    }); 
  },
  //Get input data and update firebase data
  update : function(key, obj){
    var updateRef = articleCollection.child(key);   
    updateRef.update(obj);
  },
  //Delete firebase article
  delete : function(id){
    var articleRef = new Firebase('https://toshiapp.firebaseio.com/articles/' + id); 
    articleRef.remove();
  }
};        
  
$(document).ready(function(){
  tsFunction.init();
});



 




