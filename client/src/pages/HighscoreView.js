import React, { useState } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { Card, Icon, Loader } from "semantic-ui-react";
import rearrangeBingoBoxes from "../util/rearrangeBingoBoxes";

import { Image } from "cloudinary-react";

const { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME } = require("../util/config");

function HighscoreView(props) {
  const matchId = props.match.params.matchId;
  const [openData, setOpenData] = useState({
    index: 2000,
    newOrder: [],
  });

  const { data: match, loading: loadingMatch } = useQuery(FETCH_MATCH_QUERY, {
    variables: {
      matchId,
    },
    onError(err) {
      console.log(err);
    },
  });

  const { data: bingo, loading: loadingBingo } = useQuery(
    FETCH_BINGO_WITH_GAMECODE_QUERY,
    {
      variables: {
        matchId,
      },
      onError(err) {
        console.log(err);
      },
    }
  );

  let MarkUp;
  if (loadingMatch || loadingBingo) {
    MarkUp = <Loader />;
  } else {
    let players = [];
    for (let i = 0; i < match.getMatch.players.length; i++) {
      if (!(match.getMatch.players[i].finishedAt === "")) {
        players.push(match.getMatch.players[i]);
      }
    }

    players.sort(function (a, b) {
      return a.finishedAt < b.finishedAt
        ? -1
        : a.finishedAt > b.finishedAt
        ? 1
        : 0;
    });
    let bingoBoxes = bingo.getBingoWithGameCode.bingoBoxes;
    MarkUp = (
      <div style={{ maxWidth: "600px", margin: "auto" }}>
        {players.map((player, index) => (
          <div
            key={player.id}
            style={
              openData.index === index
                ? { paddingBottom: "100%", marginBottom: "1em" }
                : { marginBottom: "1em" }
            }
          >
            <Card
              fluid
              onClick={() =>
                setOpenData({
                  index,
                  newOrder: rearrangeBingoBoxes(bingoBoxes, player),
                })
              }
            >
              <Card.Content>
                <Card.Header>
                  {openData.index === index ? (
                    <Icon name="angle down" size="large" floated="right" />
                  ) : (
                    <Icon name="angle up" size="large" floated="right" />
                  )}
                  {index + 1 + ". " + player.nick}
                  <Card.Meta>{player.finishedAt}</Card.Meta>
                </Card.Header>
              </Card.Content>
              {openData.index === index && (
                <Card className="highscoreBingo" fluid>
                  <div className="highscoreBingoOverlay">
                    {openData.newOrder.map((bingoBox) => (
                      <React.Fragment key={bingoBox.id}>
                        {bingoBox.checked ? (
                          <div className="highscoreBingoBoxOverlay checked"></div>
                        ) : (
                          <>
                            <div className="highscoreBingoBoxOverlay"></div>
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="highscoreBingoContainer">
                    {openData.newOrder.map((bingoBox) => (
                      <React.Fragment key={bingoBox.id}>
                        {console.log(bingoBox)}
                        {bingoBox.cloudinaryId === "" ? (
                          <div className="highscoreBingoBox">
                            <p>{bingoBox.title}</p>
                          </div>
                        ) : (
                          <>
                            <Image
                              cloudName={`${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`}
                              publicId={bingoBox.cloudinaryId}
                              responsive
                              width="auto"
                              crop="scale"
                              className="highscoreBingoBox"
                            />
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </Card>
              )}
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return MarkUp;
}

const FETCH_MATCH_QUERY = gql`
  query($matchId: ID!) {
    getMatch(matchId: $matchId) {
      gameCode
      bingoId
      players {
        id
        nick
        finishedAt
        boxOrder {
          id
          placement
          checked
        }
      }
    }
  }
`;

const FETCH_BINGO_WITH_GAMECODE_QUERY = gql`
  query($matchId: String!) {
    getBingoWithGameCode(matchId: $matchId) {
      id
      title
      description
      createdAt
      username
      bingoBoxes {
        id
        title
        summery
        cloudinaryId
      }
    }
  }
`;

export default HighscoreView;
