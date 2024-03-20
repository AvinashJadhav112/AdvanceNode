//puppeteer is used for integration tetsting with browser it will communicate 
//with chromium nd mock the integration tests
// const puppeteer  =require("puppeteer")
const sessionFactory=require('./factories/sessionFactory')
const userFactory=require('./factories/userFactory')
const Page=require('./helpers/page');
let page;
//let browse; now we dont need browser the indtance we take in page function from helpers
//to run something before each and every test
beforeEach(async()=>{
    // browser=await puppeteer.launch({
    //     headless:false, //headless means as soon as possible
    // });
    //  page=await browser.newPage(); //will cretae a new page that is a broswer tab
    page=await Page.build() // from helpers

    await page.goto('localhost:3000')// goes to the  specified url
})

afterEach(async()=>{
    // await browser.close() //to kill all the running instances of chromium for new tests
    await page.close();
})

test('the header has the correct text',async()=>{
   
    // const text =await page.$eval('a.brand-logo',el=>el.innerHTML)
    //we used getcOntents function in helper for reusbility

 const text =await page.getContentsOf('a.brand-logo')
    expect(text).toEqual('Blogster')
})

test('clicking login starts oauth flow',async()=>{
    //click on thr loginAuth by google  button
    await page.click('.right a')

    const url=await page.url() // this gets the url of the current page
    expect(url).toMatch(/accounts\.google\.com/); // to check if the url contains  'accounts.google.com'
})

test('when signed in shows logout button',async()=>{
    //mocking the oAUth flow for not actaully going to google servers everytime to test
    //so teh logic is to create a same object as Oauth used for authentication and cretae a copy like that
    //you can see this in network tabs for blogs request
    // const id='65e963b7fce71839c8e6b0dd' //id from user in mogodatabse for mocking 
    

//     const  user=await userFactory() //creating
//     // console.log(sessionString,sig)
//   const {session,sig}=sessionFactory(user)

//    await page.setCookie({name:'session',value: session})
//    await page.setCookie({name:'session.sig',value:sig})
//    await page.goto('localhost:3000');
//    await page.waitFor('a[href="/auth/logout"]')
//this sectin is moved to helper page.js

await page.login() //from helper [age.js]

//    const text=await page.$eval('a[href="/auth/logout"]',el=>el.innerHTML)
const text=await page.getContentsOf('a[href="/auth/logout"]')
   expect(text).toEqual('Logout')

})