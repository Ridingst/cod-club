import dash
import dash_core_components as dcc
import dash_html_components as html
import dash_table
import plotly.express as px
import plotly.graph_objects as go
import turicreate as tc 

from decouple import config
from pymongo import MongoClient

MONGO_USERNAME = config('MONGO_INITDB_ROOT_USERNAME')
MONGO_PASSWORD = config('MONGO_INITDB_ROOT_PASSWORD')
MONGO_HOST = config('MONGO_HOST', default='localhost:27017')

DASH_HOST = config('DASH_HOST', default='localhost')
DASH_PORT = config('DASH_PORT', default='8050')

COD_PLAYERS = config('COD_PLAYERS').split(',')

external_stylesheets = ['https://codepen.io/chriddyp/pen/bWLwgP.css']

app = dash.Dash(__name__, external_stylesheets=external_stylesheets)

client = MongoClient(MONGO_HOST, username=MONGO_USERNAME, password=MONGO_PASSWORD)
db = client['user_data']
coll = db['stats']

# Check we can connect or error
print(client.server_info())

historic_data_pipeline = [
    {'$match': {'username': { '$in': COD_PLAYERS }}},
    {'$group': {'_id': '$username', 'stats': {'$push': {
        'date': '$date',
        'wins': '$stats.calcStats.wins',
        'winPerc': '$stats.calcStats.winPerc',
        'top5': "$stats.calcStats.topFive",
        'top5Perc': "$stats.calcStats.topTenPerc",
        'top10': "$stats.calcStats.topTen",
        'top10Perc': "$stats.calcStats.topTenPerc",
        'kills': "$stats.calcStats.kills",
        'killsPerGame': "$stats.calcStats.killsPerGame",
        'gamesPlayed': "$stats.calcStats.gamesPlayed",
        'avgScore': "$stats.calcStats.averageScore",
        'kdRatio': "$stats.calcStats.kdRatio",
    }}}},
    {'$unwind': '$stats'},
    #{ "$project": {
    #  "y":{"$year":"$stats.date"},
    #  "m":{"$month":"$stats.date"},
    #  "d":{"$dayOfMonth":"$stats.date"},
    #  "h":{"$hour":"$stats.date"},
    #  "kd":"$stats.kd",
    #  'gamesPlayed': "$stats.gamesPlayed"}
    #},
    #{ "$group":{ 
    #   "_id": { "username": "$_id", "year":"$y","month":"$m","day":"$d","hour":"$h"},
    #   "kd":{ "$last": "$kd"},
    #   "gamesPlayed":{ "$last": "$gamesPlayed"}
    #}},
    #{ "$group": {'_id': "$_id.username", "kd": {"$push": {
    #    "kd": "$kd",
    #    "year": "$_id.year",
    #    "month": "$_id.month",
    #    "day": "$_id.day",
    #    "hour": "$_id.hour"
    #}}}},
]

historic_data = list(coll.aggregate(historic_data_pipeline))
historic_sf = tc.SFrame(historic_data).unpack().unpack()

historic_df = historic_sf.to_dataframe()

#fig = px.line(historic_df, x='date', y='winPerc', color='_id')
fig=go.Figure()
# set up ONE trace
for player in COD_PLAYERS:
    print(player)
    tmp_data = historic_sf[historic_sf['_id'] == player]

    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['wins']), name=player,visible=True))
    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['winPerc']), name=player, visible=False))
    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['top5']), name=player, visible=False))
    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['top5Perc']), name=player, visible=False))
    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['top10']), name=player, visible=False))
    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['top10Perc']), name=player, visible=False))
    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['kills']), name=player, visible=False))
    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['killsPerGame']), name=player, visible=False))
    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['gamesPlayed']), name=player, visible=False))
    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['avgScore']), name=player, visible=False))
    fig.add_trace(go.Scatter(x=list(tmp_data['date']),y=list(tmp_data['kdRatio']), name=player, visible=False))

# Update plot sizing
fig.update_layout(
    height=900,
    autosize=True,
    margin=dict(t=0, b=0, l=0, r=0),
    template="plotly_white",
)
# Add dropdown
fig.update_layout(
    updatemenus=[
        dict(
            buttons=list([
                dict(
                    args=[{"visible": [True, False, False, False, False, False, False, False, False, False, False, ]}],
                    label="Total Wins",
                    method="update"
                ),
                dict(
                    args=[{"visible": [False, True, False, False, False, False, False, False, False, False, False, ]}],
                    label="Win Percentage",
                    method="update"
                ),
                dict(
                    args=[{"visible": [False, False, True, False, False, False, False, False, False, False, False, ]}],
                    label="Total Top 5",
                    method="update"
                ),
                dict(
                    args=[{"visible": [False, False, False, True, False, False, False, False, False, False, False, ]}],
                    label="Top 5 Percentage",
                    method="update"
                ),
                dict(
                    args=[{"visible": [False, False, False, False, True, False, False, False, False, False, False, ]}],
                    label="Total Top 10",
                    method="update"
                ),
                dict(
                    args=[{"visible": [False, False, False, False, False, True, False, False, False, False, False, ]}],
                    label="Top 10 Percentage",
                    method="update"
                ),
                dict(
                    args=[{"visible": [False, False, False, False, False, False, True, False, False, False, False, ]}],
                    label="Total Kills",
                    method="update"
                ),
                dict(
                    args=[{"visible": [False, False, False, False, False, False, False, True, False, False, False, ]}],
                    label="Kills Per Game",
                    method="update"
                ),
                dict(
                    args=[{"visible": [False, False, False, False, False, False, False, False, True, False, False, ]}],
                    label="Games Played",
                    method="update"
                ),
                dict(
                    args=[{"visible": [False, False, False, False, False, False, False, False, False, True, False, ]}],
                    label="Average Score",
                    method="update"
                ),
                dict(
                    args=[{"visible": [False, False, False, False, False, False, False, False, False, False, True, ]}],
                    label="Kill:Death Ratio",
                    method="update"
                ),
            ]),
            direction="down",
            pad={"r": 10, "t": 10},
            showactive=True,
            x=0.1,
            xanchor="left",
            y=1.1,
            yanchor="top"
        ),
    ]
)
fig.update_layout(hovermode='x unified')
winPerCentageTimeFig = dcc.Graph(id='example-graph',figure=fig)

data_table = html.Div([dash_table.DataTable(
    id='datatable',
    columns=[
        {"name": i, "id": i} for i in historic_df.columns
    ],
    data=historic_df.to_dict('records'),
    filter_action="native",
    sort_action="native",
    sort_mode="multi",
    selected_columns=[],
    selected_rows=[],
    page_action="native",
    page_current= 0,
    page_size= 10,
)])

app.layout = html.Div(children=[
    html.H1(children='Hillcroft Cod Club'),
    #data_table,
    winPerCentageTimeFig
])
if __name__ == '__main__':
    app.run_server(host=DASH_HOST, port=DASH_PORT, debug=True)