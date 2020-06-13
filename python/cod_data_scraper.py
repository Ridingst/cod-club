import asyncio, json, datetime, callofduty
from callofduty import Mode, Platform, Title
from decouple import config

# Get environment variables
USER = config('COD_API_USER')
PASSWORD = config('COD_API_PASSWORD')

hillcroft_players = [
    'YogiBear917886',
    'RhysLightning89',
    'Benladan',
    'Moonsungipung 2',
    'MDKempi3',
    'uk1Paton',
    'WhiffyLion',
    'jaqqq420',
    'Jonno4057',
    'la cucaracha',
    'christturner24',
    'Rindingers'
]

async def getFriends(client):
    friends = await client.GetMyFriends()
    me = await client.GetMyAccounts()
    friends = friends + me[0:1]
    return friends

async def getPlayerStats(player):
    resp = dict()
    resp['username'] = str(str(player.username).split("#")[0])
    
    lifetimeStats = await player.profile(Title.ModernWarfare, Mode.Warzone)
    lifetimeStatsCalc = await calcScores(lifetimeStats)
    resp['lifetime'] = lifetimeStatsCalc
    
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
    
async def getFriendsStats(client):
    friends = await getFriends(client)
    resp = list()
    
    for friend in friends:
        if(friend.username.split('#')[0] in hillcroft_players):
            friendStats = await getPlayerStats(friend)
            resp.append(friendStats)
        
    me = await client.GetPlayer(Platform.Activision, 'Rindingers')
    
        
    return resp

async def createNewStatsFile(client):
    stats = await getFriendsStats(client)
    data = {}
    data['date'] = ':'.join(str(datetime.datetime.now()).split(':')[0:2])
    data['players'] = stats
    with open('./data/players_data.js', 'w+') as outfile:
        outfile.write('data = ')
        json.dump(data, outfile)
        
    return 'done'

async def main():
    print('Starting...')
    client = await callofduty.Login(USER, PASSWORD)
    await createNewStatsFile(client)
    print('Finished.')

asyncio.run(main())
