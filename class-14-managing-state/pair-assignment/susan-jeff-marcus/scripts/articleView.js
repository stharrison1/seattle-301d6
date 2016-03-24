(function(module) {

  var articleView = {};

  var render = function(article) {
    var template = Handlebars.compile($('#article-template').text());

    article.daysAgo = parseInt((new Date() - new Date(article.publishedOn))/60/60/24/1000);
    article.publishStatus = article.publishedOn ? 'published ' + article.daysAgo + ' days ago' : '(draft)';
    article.body = marked(article.body);

    return template(article);
  };

  // COMMENT: What does this method do?  What is it's execution path?
  //Dynamically generates the dropdown menus for both authors and categories filtering.  It first grabs the handlebars template
  articleView.populateFilters = function() {
    var options,
      template = Handlebars.compile($('#option-template').text()); //grabs the handlebar template and handlebars compiles the template and populates the filters.

    // Example of using model method with FP, synchronous approach:
    // NB: This method is dependant on info being in the DOM. Only authors of shown articles are loaded.

    //For each item in the array, returns the html tag with author name in it
    options = Article.allAuthors().map(function(author) { return template({val: author}); });
    // if ($('#author-filter option').length < 2) { // Prevent duplication
    $('#author-filter').append(options); //
    // };

    // Example of using model method with async, SQL-based approach:
    // This approach is DOM-independent, since it reads from the DB directly.
    Article.allCategories(function(rows) {  //The Articles.allCategories function searches all the category values inside the database
      if ($('#category-filter option').length < 2) {
        $('#category-filter').append( //For every category in array, it creates a new option tag in the select tag for the drop down and fills in the name with the value from the array.
          rows.map(function(row) {
            return template({val: row.category});
          })
        );
      };
    });
  };

  // COMMENT: What does this method do?  What is it's execution path?
// WHEN YOU CLICK ON SPECIFIC AUTHOR IN THE DROPDOWN OPTION, IT FIRES THIS FUNCTION TO CHANGE TO NEW URL CHOOSEN
  articleView.handleFilters = function() {
    $('#filters').one('change', 'select', function() {
      //grab the id value and then removes the '-filter'.
      resource = this.id.replace('-filter', '');
      //change the routes to for example, '/author/author'sname'
      page('/' + resource + '/' + $(this).val().replace(/\W+/g, '+')); // Replace any/all whitespace with a +
    });
  };

//For admin.html file
  articleView.initNewArticlePage = function() {
    $('#articles').show().siblings().hide();

    $('#export-field').hide();
    $('#article-json').on('focus', function(){
      this.select();
    });

    $('#new-form').on('change', 'input, textarea', articleView.create);
  };

  articleView.create = function() {
    var article;
    $('#articles').empty();

    // Instantiate an article based on what's in the form fields:
    article = new Article({
      title: $('#article-title').val(),
      author: $('#article-author').val(),
      authorUrl: $('#article-author-url').val(),
      category: $('#article-category').val(),
      body: $('#article-body').val(),
      publishedOn: $('#article-published:checked').length ? util.today() : null
    });

    $('#articles').append(render(article));

    $('pre code').each(function(i, block) {
      hljs.highlightBlock(block);
    });

    // Export the new article as JSON, so it's ready to copy/paste into blogArticles.js:
    $('#export-field').show();
    $('#article-json').val(JSON.stringify(article) + ',');
  };


  // COMMENT: What does this method do?  What is it's execution path?
  //THIS FUNCITON SHOWS THE ARTICLES SECTION AND HIDE OTHER SECTIONS, AND THEN REMOVE THE OLD ARTICLE IN HTML TAG.
  //THEN INSERT NEW ARTICLES. THEN UPDATA THE DROPDOWN MENUS BASED ON THE CURRENT DOM ELEMENTS.
  articleView.index = function(articles) {
    
    $('#articles').show().siblings().hide();

    $('#articles article').remove();

    articles.forEach(function(a) {
      $('#articles').append(render(a));
    });
    //DISPLAY THE DROPDOWN MENUS
    articleView.populateFilters();
    // COMMENT: What does this method do?  What is it's execution path?
    // DISCRIBED ABOVE ON LINE 44
    articleView.handleFilters();

    // DONE: Replace setTeasers with just the truncation logic, if needed:
    if ($('#articles article').length > 1) {
      $('.article-body *:nth-of-type(n+2)').hide();
    }
  };

  articleView.initAdminPage = function() {
    var template = Handlebars.compile($('#author-template').text());

    Article.numWordsByAuthor().forEach(function(stat) {
      $('.author-stats').append(template(stat));
    });

    $('#blog-stats .articles').text(Article.all.length);
    $('#blog-stats .words').text(Article.numWordsAll());
  };

  module.articleView = articleView;
})(window);
