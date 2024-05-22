"use client";
import { useEffect, useRef, useState } from "react";
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

const MSG_TYPE = {
  INCOMING: "icoming",
  OUTGOING: "outgoing",
  ERROR: "error",
};

export default function Home() {
  const msgInputRef = useRef<any>(null);

  const [messages, setMessages] = useState([
    {
      type: MSG_TYPE.INCOMING,
      content: "Za pokretanje AI Buddy-a upišite svoje ime.",
    },
  ]);
  // const [history, setHistory] = useState<IHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [answers, setAnswers] = useState<string[]>([]);
  const [history, setHistory] = useState<IHistory[]>([]);

  useEffect(() => {
    function autoExpand() {
      const textarea = document.getElementById("myTextarea");
      if (textarea) {
        textarea.style.height = "auto"; // Reset height to auto to calculate actual height
        textarea.style.height = textarea.scrollHeight + "px"; // Set height to fit content
      }
    }

    autoExpand(); // Call autoExpand after the component is mounted

    // Cleanup function
    return () => {
      // You can remove event listeners or perform other cleanup here if needed
    };
  }, []);

  const handleSendMessage = (value: string) => {
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
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>AI buddy</div>
      <div className={styles.conversationConteiner}>
        {messages.map((x, index) => (
          <div className={`${styles.messageBox} ${styles[x.type]}`} key={index}>
            <p>{x.content}</p>
          </div>
        ))}
      </div>
      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingIndicator}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
          </div>
        </div>
      )}
      <div className={styles.footer}>
        <textarea
          ref={msgInputRef}
          placeholder="Unesite poruku"
          disabled={isLoading}
          className={styles.msgInput}
          onChange={() => {
            const textarea = msgInputRef.current;
            if (textarea) {
              textarea.style.height = "auto"; // Reset height to calculate actual height
              textarea.style.height = `${textarea.scrollHeight}px`; // Set height to fit content
            }
          }}
          rows={1}
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
          S
        </button>
      </div>
    </main>
  );
}
