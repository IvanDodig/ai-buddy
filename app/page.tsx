"use client";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import { IHistory, postAIChatMessages } from "@/services/services";
import Footer from "./components/footer/Footer";
import Loader from "./components/loader/Loader";
import RepeatIcon from "@/components/icons/RepeatIcon";

const questions = [
  (value: string) =>
    `Pozdrav ${value}. Molimo navedite u kojem ćete gradu biti na GO.`,
  (value: string) => `Molimo navedite kojeg datuma dolazite u ${value}.`,
  (value: string) => `Do kada ostajete?`,
  (value: string) =>
    `U tom razdoblju imamo različitih događanja. Upišite što od navedenog Vas zanima: Koncerti, Kino, izložbe, nogometne utakmice.`,
];

const createTemplateString = (answers: string[]) =>
  `Molim te ${answers[4]} za grad ${answers[1]} izmedju datuma ${answers[2]} i ${answers[3]}`;

const MSG_TYPE = {
  INCOMING: "icoming",
  OUTGOING: "outgoing",
  ERROR: "error",
};

export default function Home() {
  const messagesEndRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [history, setHistory] = useState<IHistory[]>([]);
  const [messages, setMessages] = useState([
    {
      type: MSG_TYPE.INCOMING,
      content: "Za pokretanje AI Buddy-a upišite svoje ime.",
    },
  ]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (value: string) => {
    setErrorMessage(undefined);
    setMessages((x) => [
      ...x,
      {
        type: MSG_TYPE.OUTGOING,
        content: value,
      },
    ]);

    if (answers.length < questions.length) {
      setMessages((x) => [
        ...x,
        {
          type: MSG_TYPE.INCOMING,
          content: questions[answers.length](value),
        },
      ]);

      setAnswers((answers) => [...answers, value]);
      return;
    }

    setIsLoading(true);

    const User =
      history.length === 0 ? createTemplateString([...answers, value]) : value;

    postAIChatMessages({
      History: [
        ...history,
        {
          Bot: null,
          User,
        },
      ],
    })
      .then((res) => {
        if (res?.answer) {
          setMessages((x) => [
            ...x,
            {
              type: MSG_TYPE.INCOMING,
              content: res?.answer,
            },
          ]);
          setHistory([...history, { Bot: res.answer, User }]);
          return;
        }
        setMessages((x) => {
          const newMessages = [...x];
          newMessages.pop();
          return newMessages;
        });

        setErrorMessage(value);
      })
      .catch(() => {
        setMessages((x) => {
          const newMessages = [...x];
          newMessages.pop();
          return newMessages;
        });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>AI buddy</div>
      <div className={styles.conversationConteiner}>
        {messages.map((x, index) => (
          <div className={`${styles.messageBox} ${styles[x.type]}`} key={index}>
            {x.content.split("\n").map((msg, index) => (
              <p
                key={index}
                style={{ minHeight: "1rem", wordWrap: "break-word" }}
              >
                {msg}
              </p>
            ))}
          </div>
        ))}
        {errorMessage && (
          <div className={`${styles.messageBox} ${styles[MSG_TYPE.ERROR]}`}>
            <div>
              {errorMessage.split("\n").map((msg, index) => (
                <p
                  key={index}
                  style={{ minHeight: "1rem", lineBreak: "anywhere" }}
                >
                  {msg}
                </p>
              ))}
            </div>
            <button
              onClick={() => handleSendMessage(errorMessage)}
              className={styles.repeatButton}
            >
              <RepeatIcon />
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {isLoading && <Loader />}
      <Footer handleSendMessage={handleSendMessage} isLoading={isLoading} />
    </main>
  );
}
