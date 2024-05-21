export interface IHistory {
  User: string;
  Bot: string | null;
}
interface IProps {
  History: IHistory[];
}

export const postAIChatMessages = ({ History }: IProps) => {
  return fetch("https://app-backend-xsmwbre7tvjhw.azurewebsites.net/api/chat", {
    method: "POST",
    body: JSON.stringify({
      History,
      Approach: 0,
      Overrides: {
        RetrievalMode: 2,
        Top: 1,
        SuggestFollowupQuestions: false,
        Temperature: 0.1,
        SemanticRanker: true,
      },
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  })
    .then((res) => res.json())
    .catch((err) => {
      return { error: true };
    });
};
