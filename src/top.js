// function resolveAfter2Seconds(x) {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve(x);
//     }, 2000);
//   });
// }
//
// async function add1(x) {
//   var a = resolveAfter2Seconds(20);
//   var b = resolveAfter2Seconds(30);
//   return x + await a + await b;
// }
//
// add1(10).then(v => {
//   console.log(v);  // prints 60 after 2 seconds.
// });
//
// async function add2(x) {
//   var a = await resolveAfter2Seconds(20);
//   var b = await resolveAfter2Seconds(30);
//   return x + a + b;
// }
//
// add2(10).then(v => {
//   console.log(v);  // prints 60 after 4 seconds.
// });


function calcTime(city, offset) {
  // create Date object for current location
  var d = new Date();

  // convert to msec
  // subtract local time zone offset
  // get UTC time in msec
  var utc = d.getTime() - (d.getTimezoneOffset() * 60000);

  // create new Date object for different city
  // using supplied offset
  var nd = new Date(utc);

  // return time as a string
  return "The local time for city"+ city +" is "+ nd.toISOString();
}

console.log(calcTime('MSC', ''));