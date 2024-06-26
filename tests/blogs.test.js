const Page=require('./helpers/page')

let page;

beforeEach(async()=>{
    page= await Page.build()
    await page.goto('localhost:3000')
})

afterEach(async()=>{
    await page.close();
})



describe("when logged in",async ()=>{
    beforeEach(async ()=>{
        await page.login();
        await page.click('a.btn-floating');
    })


    test('when logged in can see blog create form',async()=>{
        await page.login()
        await page.click('a.btn-floating');
    
        const label=await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title')
    })

describe('And using valid inputs',async()=>{
    beforeEach(async ()=>{
        await page.type('.title input','My Title');
        await page.type('.content input', 'My Content')
        await page.click('form button');
    })

    test('Submitting takes user to review screen',async()=>{
            const text=await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries')
    })

    test('Submitting then saving adds blog to index page',async()=>{
        await page.click('button.green')
        await page.waitFor('.card')

        const title=await page.getContentsOf('.card-title')
        const content =await page.getContentsOf('p')
        expect(title).toEqual('My Title')
        expect(content).toContain('My Content')
    })


})

    describe('And using invalid inputs',async()=>{
        beforeEach(async()=>{
            await page.click('form button');
        })
        test('the form shows and error message',async ()=>{
            const titleError=await page.getContentsOf('.title .red-text')
            const contentError=await page.getContentsOf('.content .red-text')
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        })
    })
})

describe('User is not logged in',async()=>{
    test('User cannot create blog posts',async()=>{
        const result=await page.evaluate(
            async ()=>{
                const res = await fetch('/api/blogs', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: 'My Test Blog',
                        content: 'My test content'
                    })
                });
                return await res.json();
            }
        )
        expect(result).toEqual({error: 'You must log in!'});
    })

    test('User cannot get a list of posts',async()=>{
        const result=await page.evaluate(
            async ()=>{
                const res = await fetch('/api/blogs', {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                });
                return await res.json();
            }
        )
        expect(result).toEqual({error: 'You must log in!'});
    })

})