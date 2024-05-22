import SendIcon from "@/components/icons/SendIcon";
import { useRef } from "react";
import styles from "./Footer.module.css";

interface IProps {
  handleSendMessage: (value: string) => void;
  isLoading: boolean;
}
const Footer = ({ handleSendMessage, isLoading }: IProps) => {
  const msgInputRef = useRef<any>(null);

  const adjustTextareaHeight = () => {
    const textarea = msgInputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <div className={styles.footer}>
      <textarea
        ref={msgInputRef}
        placeholder="Unesite poruku"
        className={styles.msgInput}
        rows={1}
        onInput={adjustTextareaHeight}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();

          const value = msgInputRef?.current?.value;
          if (!value) return;

          if (e.key === "Enter" && e.shiftKey) {
            msgInputRef.current.value = value + "\n";
            adjustTextareaHeight();
            return;
          }

          if (e.key === "Enter") {
            if (isLoading) return;
            handleSendMessage(value);
            msgInputRef.current.value = "";
            adjustTextareaHeight();

            return;
          }
        }}
      />
      <button
        className={styles.sendBtn}
        disabled={isLoading}
        onClick={() => {
          if (isLoading) return;
          const value = msgInputRef?.current?.value;
          if (!value) return;
          handleSendMessage(value);
          msgInputRef.current.value = "";
          adjustTextareaHeight();
        }}
      >
        <SendIcon />
      </button>
    </div>
  );
};

export default Footer;
