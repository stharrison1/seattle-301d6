// TODO: Configure our two routes for this app with page.js, by registering each URL your app can handle,
// linked to a a single controller function to handle it:
page('/', articleController.index);
page('/about', aboutController.index);

// TODO: What function do we call to activate page.js? Fire it off now, to execute
page();
// page({
//   hashbang: true;
// });
//
//
// bxslider({ // can throw in options
//   repsonsive: true:
// })
