jest.mock('youtube-node', () => jest.fn())
const search = require('../../../../lib/models/search'),
    youtube = require('youtube-node'),
    faker = require('faker')

describe('search should', () => {
    let youtubeMock = {
        setKey: jest.fn(),
        addParam: jest.fn(),
        search: jest.fn()
    }
    beforeEach(() => {
        youtube.mockImplementation(() => youtubeMock)
    })

    test('have init method that initializes youtube', async () => {
        search.init()
        expect(youtube).toBeCalled()
        expect(youtubeMock.setKey).toBeCalledWith('AIzaSyAZj8aLet_vlpgn6tYW_8m3T6qmEAiILJQ')
    });

    test('have settings method that sets configuration values', async () => {
        let params = {
            numberResults: faker.random.uuid(),
            mode: faker.random.uuid(),
            type: faker.random.uuid()
        }
        search.settings(params)
        expect(search._.numberResults.value).toEqual(params.numberResults)
        expect(youtubeMock.addParam).toBeCalledWith('safeSearch', params.mode)
        expect(youtubeMock.addParam).toBeCalledWith('type', params.type)
    });

    test('should have find method that return list of videos', async () => {
        let expectedResult = {items: [faker.random.uuid(),faker.random.uuid()]}
        youtubeMock.search.mockImplementation((_, __, cb) => cb(undefined, expectedResult))
        let query = faker.random.uuid()
        let result = await search.find(query)
        expect(youtubeMock.search).toBeCalledWith(query, search._.numberResults.value, expect.anything()) 
        expect(result).toEqual(expectedResult.items)
    });

    test('should reject on error finding video', async () => {
        youtubeMock.search.mockImplementation((_, __, cb) => cb("error", undefined))
        let query = faker.random.uuid()
        await expect(search.find(query)).rejects.toEqual("error")
    });
})

// find: (query) ->
// return new Promise (resolve, reject) =>
//     @youtube.search query, @numberResults, (error, result) ->
//         if error
//             reject error
//         else
//             resolve result.items