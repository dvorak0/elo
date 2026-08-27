import "./App.css";
import { Client, Databases, ID, Functions, Account } from "appwrite";
import { useEffect, useState } from "react";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid";

function BuildGame({ game }) {
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  //const [matches, setMatches] = useState([]);
  const [playerPair, setPlayerPair] = useState([]);
  const [submitCount, setSubmitCount] = useState(0);
  const [wait, setWait] = useState(true);
  const [userId, setUserId] = useState(null);

  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
  }));

  const score2bar = (score) => {
    return ((score - 800) / 400) * 100;
  };
  const client = new Client();
  client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("65cec67eba36c60d8862");

  const DB_ID = "65cec72e68bfe1839d59";
  const MATCHES_COLLECTION_ID = "65cec75bb81b5490f988";

  const databases = new Databases(client);
  const functions = new Functions(client);
  const account = new Account(client);

  function randomPick(players) {
    do {
      var player_A = players[Math.floor(Math.random() * players.length)].player;
      var player_B = players[Math.floor(Math.random() * players.length)].player;
    } while (player_A === player_B);
    setPlayerPair([player_A, player_B]);
  }

  useEffect(() => {
    account.getSession("current").then(
      function (response) {
        setUserId(response.userId);
      },
      function (error) {
        if (error.code !== 401) {
          console.error(error);
        }
      },
    );

    const promise = functions.createExecution("6606ed296d0cfbcabcc0", game);

    promise.then(
      function (response) {
        const res = JSON.parse(response.responseBody);
        setScores(res.scores);
        const players = Object.keys(res.scores).map((player) => ({
          player: player,
        }));
        setPlayers(players);
        randomPick(players);
        setWait(false);
      },
      function (error) {
        console.log(error); // Failure
        setWait(false);
      },
    );
  }, [game, submitCount]);

  async function submitMatch(winner) {
    databases
      .createDocument(DB_ID, MATCHES_COLLECTION_ID, ID.unique(), {
        Game: game,
        A: playerPair[0],
        B: playerPair[1],
        Winner: winner,
        UserID: userId,
        Date: new Date().toISOString(),
      })
      .then((response) => {});
    randomPick(players);
    setSubmitCount(submitCount + 1);
    setWait(true);
  }

  return (
    <div key={game}>
      <Grid container spacing={2} sx={{ maxWidth: 800 }}>
        <Grid size={12}>
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>item</TableCell>
                  <TableCell align="right">score</TableCell>
                  <TableCell align="left">bar</TableCell>
                  <TableCell align="right">count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scores &&
                  Object.keys(scores)
                    .sort((a, b) => scores[b]["score"] - scores[a]["score"])
                    .map((player, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {player}
                        </TableCell>
                        <TableCell align="right">
                          {Math.round(scores[player]["score"])}
                        </TableCell>
                        <TableCell align="left">
                          <LinearProgress
                            variant="determinate"
                            value={score2bar(scores[player]["score"])}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {scores[player]["count"]}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        {wait && (
          <Grid size={12}>
            <LinearProgress />
          </Grid>
        )}
        {!wait && (
          <>
            <Grid size={4}>
              <Item>{playerPair[0]}</Item>
            </Grid>
            <Grid size={4}>
              <Item>V.S.</Item>
            </Grid>
            <Grid size={4}>
              <Item>{playerPair[1]}</Item>
            </Grid>
            <Grid size={4}>
              <Button
                style={{ width: "100%" }}
                variant="contained"
                onClick={() => {
                  submitMatch(playerPair[0]);
                }}
              >
                👈 Left is Better 👈
              </Button>
            </Grid>
            <Grid size={4}>
              <Button
                style={{ width: "100%" }}
                variant="contained"
                onClick={() => {
                  submitMatch("tie");
                }}
              >
                🤝 Tie 🤝
              </Button>
            </Grid>
            <Grid size={4}>
              <Button
                style={{ width: "100%" }}
                variant="contained"
                onClick={() => {
                  submitMatch(playerPair[1]);
                }}
              >
                👉 Right is Better 👉
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );
}
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>{children}</Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function App() {
  const client = new Client();

  client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("65cec67eba36c60d8862");
  const databases = new Databases(client);
  const account = new Account(client);

  const [games, setGames] = useState([]);

  const DB_ID = "65cec72e68bfe1839d59";
  const GAMES_COLLECTION_ID = "65cec746cd3d46950c55";

  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    localStorage.setItem("gameID", JSON.stringify(newValue));
  };

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("gameID"));
    if (items) {
      setValue(items);
    }
    databases.listDocuments(DB_ID, GAMES_COLLECTION_ID).then((response) => {
      // setgame using response.documents
      const games = response.documents.map((item) => item.Game);
      // shuffle games
      games.sort(() => Math.random() - 0.5);
      setGames(games);
    });
  }, []);

  const labelMap = {
    Cities: "城市",
    BigNames: "企业家",
    GameConsoles: "游戏主机",
    Cars: "汽车",
    Phones: "手机",
    Editors: "编辑器",
    Assets: "投资",
    Celebrities: "历史影响力",
  };
  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            {games.map((game, index) => (
              <Tab key={game} label={labelMap[game]} {...a11yProps(index)} />
            ))}
          </Tabs>
        </Box>
        {games.map((game, index) => (
          <CustomTabPanel value={value} index={index} key={index}>
            <BuildGame key={index} game={game} />
          </CustomTabPanel>
        ))}
      </Box>
    </>
  );

  return (
    <div className="App">
      {games.map((game, index) => (
        <BuildGame key={index} game={game} />
      ))}
    </div>
  );
}

export default App;
