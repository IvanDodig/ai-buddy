"use client";
import { useRef, useState } from "react";
import styles from "./page.module.css";
import { IHistory, postAIChatMessages } from "@/services/services";

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

export default function Home() {
  const msgInputRef = useRef<any>(null);

  const [messages, setMessages] = useState([
    {
      sender: "AI Buddy",
      content: "Za pokretanje AI Buddy-a upišite svoje ime.",
    },
  ]);
  // const [history, setHistory] = useState<IHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [answers, setAnswers] = useState<string[]>([]);
  const [history, setHistory] = useState<IHistory[]>([]);

  const handleSendMessage = (value: string) => {
    setMessages((x) => [
      ...x,
      {
        sender: "You",
        content: value,
      },
    ]);

    if (answers.length < questions.length) {
      setMessages((x) => [
        ...x,
        {
          sender: "AI Buddy",
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
              sender: "AI Buddy",
              content: res?.answer,
            },
          ]);
          setHistory([...history, { Bot: res.answer, User }]);
          return;
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>Moj AI buddy</div>
      <div className={styles.conversationConteiner}>
        {messages.map((x, index) => (
          <div className={styles.messageBox} key={index}>
            <p>{x.sender}</p>
            <p>{x.content}</p>
          </div>
        ))}
      </div>
      {isLoading && (
        <div className={styles.loadingContainer}>Učitavanje...</div>
      )}
      <div className={styles.footer}>
        <textarea
          disabled={isLoading}
          className={styles.msgInput}
          ref={msgInputRef}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const value = msgInputRef?.current?.value;
              if (!value) return;
              handleSendMessage(value);
              msgInputRef.current.value = "";
            }
          }}
        />
        <button
          className={styles.sendBtn}
          disabled={isLoading}
          onClick={() => {
            const value = msgInputRef?.current?.value;
            if (!value) return;
            handleSendMessage(value);
            msgInputRef.current.value = "";
          }}
        >
          Pošalji
        </button>
      </div>
    </main>
  );
}
