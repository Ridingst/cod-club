import asyncio, json, datetime, callofduty, traceback, logging
from callofduty import Mode, Platform, Title
from decouple import config
from pymongo import MongoClient

# Get environment variables
COD_USER = config('COD_API_USER')
COD_PASSWORD = config('COD_API_PASSWORD')
MONGO_USERNAME = config('MONGO_USERNAME')
MONGO_PASSWORD = config('MONGO_PASSWORD')

def getPlayerName(player):
    return str(str(player.username).split("#")[0])

async def getFriends(client):
    friends = await client.GetMyFriends()
    me = await client.GetMyAccounts()
    friends = friends + me[0:1]
    return friends

async def getPlayerStats(player):
    resp = dict()
    resp['fullStats'] = await player.profile(Title.ModernWarfare, Mode.Warzone)
    resp['calcStats'] = await calcScores(resp['fullStats'])
    return resp

async def calcScores(stats):
    resp = stats['lifetime']['mode']['br']['properties']
    resp['winPerc'] = round(resp['wins'] / resp['gamesPlayed'], 3)
    resp['topFivePerc'] = round(resp['topFive'] / resp['gamesPlayed'], 3)
    resp['topTenPerc'] = round(resp['topTen'] / resp['gamesPlayed'], 3)
    resp['topTwentyFivePerc'] = round(resp['topTwentyFive'] / resp['gamesPlayed'], 3)
    resp['killsPerGame'] = round(resp['kills'] / resp['gamesPlayed'], 2)
    resp['averageScore'] = round(resp['score'] / resp['gamesPlayed'], 0)
    resp['kdRatio'] = round(resp['kdRatio'], 2)
    
    return resp

async def getStats(client):
    friends = await getFriends(client)
    date = datetime.datetime.now().isoformat()
    print(date)
    resp = list()
    
    for friend in friends:
        friendObject = dict()

        friendObject['stats'] = await getPlayerStats(friend)
        friendObject['date'] = date
        friendObject['username'] = getPlayerName(friend)
        
        logging.debug('Completed API query for for user: ' + friendObject['username'] + ' (' + friendObject['date'] + ')')

        resp.append(friendObject)
    
    return resp

def writeToFile(stats, filepath):
    with open(filepath, 'w+') as outfile:
        json.dump(stats, outfile)
    return 'done'

async def dbUpload(stats):
    client = MongoClient('mongo:27017', username=MONGO_USERNAME, password=MONGO_PASSWORD)
    db = client.users
    for friend in stats:
        db[friend['username']].stats.insert_one(friend)
        logging.debug('Written results for user: ' + friend['username'] + ' (' + friend['date'] + ')')
    return

async def main():
    print('Starting...')
    client = await callofduty.Login(COD_USER, COD_PASSWORD)
    stats = await getStats(client)
    await dbUpload(stats)
    print('Finished.')

asyncio.run(main())
