//Search results hidden on page load
//Add ingredient box on load
$(document).ready(function(){
    addIngredientBox();
    $("#resultsbox").toggle(false);

    //to return box contents
    function getSearchBox(){
      var userInput="";
      $(".form-wrapper input").each(function(){
        userInput+=$(this).val()+',';
      });
      return userInput;
    }

    //run the ingredient search
    $("#schbutton").click(function(){
      console.log("clicked");
      $('.results').remove();
      searchApi(getSearchBox());
    });
    // clear all additional ingredient boxes available
    $("#clrbutton").click(function(){
      $('#wrapper').empty();
      addIngredientBox();
    });
});







//Add additional ingredient box on click
$('#Addings').on('click','.add-box',function(){
  $('.form-wrapper').removeClass("add").addClass("remove");
  $('.add-box').removeClass("add-box").addClass("remove-box").text("-");
  addIngredientBox();

});

//Remove selected ingredient boxes on click
$('#Addings').on('click','.remove-box',function(){
  $(this).parents('form').remove();
});


//To add ingredient boxes
function addIngredientBox(){
  var formWrapper= $('<form class="form-wrapper cf add" onsubmit="return false"></form>');
  var textBox=$('<input class="text-box" type="text"placeholder="List ingredients here..">');
  var button=$('<button class="add-box">+</button>');
  $(formWrapper).append(textBox);
  $(formWrapper).append(button);
  $(formWrapper).appendTo($('#wrapper'));
}


//Code executed when button is clicked
  $('#drinkSearch').click(function(){
    //Gather searchterms
    var word = document.getElementById("sbar").value;
    //Show results div, hide default main page
    $( "#mainPage").toggle(false);
    $( "#resultsbox").toggle(true);

    //Stop button from refreshing page (default function)
    event.preventDefault();
    console.log(word)

    //Get API response using searchterms
      $.getJSON("https://www.thecocktaildb.com/api/json/v1/1/search.php?s="+ word, function(Result) {
      	console.log(Result)




        Result.drinks.forEach((drink) => {
          var drinkName = drink.strDrink;
          console.log(drinkName);
    const drinkEntries = Object.entries(drink),
      //Build arrays out of the two sets of keys
      [
        ingredientsArray,
        measuresArray
      ] = [
        "strIngredient",
        "strMeasure"
      ].map((keyName) => Object.assign([], ...drinkEntries
          .filter(([key, value]) => key.startsWith(keyName))
          .map(([key, value]) => ({[parseInt(key.slice(keyName.length))]: value})))),

      // Filters empty values based on the ingredients
      {
        finalIngredients,
        finalMeasures
      } = ingredientsArray.reduce((results, value, index) => {
        if(value && value.trim() || measuresArray[index] && measuresArray[index].trim()){
          results.finalIngredients.push(value);
          results.finalMeasures.push(measuresArray[index]);
        }

        return results;
      }, {
        finalIngredients: [],
        finalMeasures: []
      }),

      // zip both arrays
      ingredientsWithMeasures = finalIngredients
        .map((value, index) => [finalMeasures[index], value]);

    // Output
    console.log("Ingredients:", finalIngredients);
    console.log("Measures:", finalMeasures);

    $('#resultsTable > tbody:last').append( "<tr><td>"+ drinkName + "</td> + <td>"+ ingredientsWithMeasures + "</td></tr>" );


    console.log("All ingredients and measures:\n", ingredientsWithMeasures
      .map(([measure, ingredient]) => `${(measure || "").trim()} ${(ingredient || "").trim()}`)
      .join("\n"));
  });

      });

  });


  function searchApi(search) {

    //Create Loading Spinner
    var opts = {
      lines: 10, // The number of lines to draw
      length: 20   , // The length of each line
      width: 15, // The line thickness
      radius: 10, // The radius of the inner circle
      corners: 0, // Corner roundness (0..1)
      rotate: 0, // The rotation offset
      color: '#ff6138', // #rgb or #rrggbb
      speed: 1, // Rounds per second
      trail: 60, // Afterglow percentage
      shadow: false, // Whether to render a shadow
      hwaccel: false, // Whether to use hardware acceleration
      className: 'spinner', // The CSS class to assign to the spinner
      zIndex: 2e9, // The z-index (defaults to 2000000000)
      top: 40, // Top position relative to parent in px
      left: 25 // Left position relative to parent in px
    };
    var target = document.getElementById('placeholderDiv');
    var spinner = new Spinner(opts).spin(target);

    //clear the placeholder items before populating the results
    $('.placeholder').remove();

    //Use the split function to separate the ingredients
    //and apply each ingredient in case of multiple ingredient search
    var searchterms = search.split(",");
    for (var j= 0; j < searchterms.length -1; j++){
      //alert("Item from search: " + searchterms[j]);
    $.ajax({
      url:"https://www.thecocktaildb.com/api/json/v1/1/filter.php?i="+searchterms[j],
      type: "GET",
      data:{key: "1", q: search.slice(0, -1)},
      dataType: "json",
      /**
      * @property {string} strDrink
      * @property {string} strDrinkThumb
      * @property {string} idDrink
      */
      success: function (response) {
        console.log(response);
        var res = JSON.parse(JSON.stringify(response));

        //If results are found create and populate card for each drink
        if (res.drinks.length > 0) {
          for (var i = 0; i < res.drinks.length; i++) {
            var strDrink = res.drinks[i].strDrink;
            var strDrinkThumb = res.drinks[i].strDrinkThumb;
            var idDrink = res.drinks[i].idDrink;
            //alert("Drink= "+idDrink + " image is " + strDrinkThumb);
            console.log(strDrink);
            createCard(strDrink, strDrinkThumb, idDrink);
          }
          //If no results returned display message and load most popular drinks instead
        } else if (res.drinks.length == 0) {
          noResultsCard('https://media.giphy.com/media/TydZAW0DVCbGE/giphy-facebook_s.jpg');
          searchApi(",");
        }

        spinner.stop();
      },
      error: function () {
      alert("error: ");
      //
    }
  });

} //closing the for loop for searchterms
}

/*end function*/


//Function that will display a no results found card
function noResultsCard() {
    var resultCard = $('<div class="results"></div>');
    var descWrapper = $('<div class="descWrapper"></div>');
    var description = $('<div class="desc"></div>').text("No drinks/cocktail found");

    $(resultCard).append(descWrapper);
    $(descWrapper).append(description);
    $(resultCard).insertBefore($('.placeholderDiv'));
}
//Function that will create and populate a recipe card
function createCard(desc, imgSrc, recId) {
    var resultCard = $('<div class="results"></div>');
    var descWrapper = $('<div class="descWrapper"></div>');
    var description = $('<div class="desc"></div>').text(desc).attr('href', imgSrc);
    var imgWrapper = $('<div class="imgWrapper flip"></div>');
    var image = $('<img class="scale flip"/>').attr('alt', desc).attr('src', imgSrc);
    var resultInformation = $('<div class="resultInformation"></div>');
    var soRank = $('<div class="soRank"></div>').text("#" + recId);
    var resultIngs = $('<div class="resultIngs"></div>');

    //append the result card
    $(resultCard).append(descWrapper);
    $(descWrapper).append(description);

    //Make a wrapper for the image
    $(descWrapper).append(imgWrapper);

    //create the link to the recipe
    $(imgWrapper).append(image);
     $(image).wrap($('<a>',{
         href: "https://www.thecocktaildb.com/drink.php?c=" + recId,
         target: '_blank'
     }));

     //Attach a tool tip to the result information for each drink/cocktail
    $(descWrapper).append(resultInformation);
    $(resultInformation).append(soRank);
    $(soRank).wrapInner($('<span>', {
        title: "Drink/Cocktail ID"
    }));

    //Add the results to the placeholder area
    $(resultInformation).append(resultIngs);
    $(resultCard).appendTo($('.placeholderDiv'));
}
