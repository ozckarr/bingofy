import React, { useState } from "react";
import { Form, Button } from "semantic-ui-react";
import { useMutation } from "@apollo/client";
import gql from "graphql-tag";
import { useHistory } from "react-router-dom";

function Highscore() {
  const [errors, setErrors] = useState({});
  let history = useHistory();

  const [values, setValues] = useState({
    gameCode: "",
  });

  const onChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const [getHighscore, { loading }] = useMutation(GET_HIGHSCORE, {
    variables: values,
    update(proxy, result) {
      values.gameCode = "";
    },
    onCompleted({ getHighscore, getHighscore: { id } }) {
      console.log(getHighscore);

      history.push(`/highscore/${id}`);
    },
    onError(err) {
      console.log(err);
      // TODO Fixa backend check
      setErrors("Fel kod");
    },
  });

  const onSubmit = (event) => {
    event.preventDefault();
    getHighscore();
  };
  return (
    <div>
      <Form onSubmit={onSubmit} noValidate className={loading ? "loading" : ""}>
        <h1>Hitta Highscore</h1>
        <Form.Input
          label="Bingokod"
          placeholder="Koden till bingot..."
          name="gameCode"
          type="text"
          value={values.gameCode}
          onChange={onChange}
        ></Form.Input>
        <Button type="submit">Se Highscore</Button>
      </Form>
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const GET_HIGHSCORE = gql`
  mutation getHighscore($gameCode: String!) {
    getHighscore(gameCode: $gameCode) {
      id
      gameCode
    }
  }
`;

export default Highscore;