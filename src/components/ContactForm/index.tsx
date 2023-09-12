import { useState } from "react";
import { toast } from "react-hot-toast";

import styles from "./styles.module.scss"

export function ContactForm() {
  const [contact, setContact] = useState({
    acessKey: process.env.NEXT_PUBLIC_STATIC_FORM_KEY,
    email: "",
    name: "",
    message: "",
  });

  const fillField = (field: any) => {
    setContact((state) => {
      return {
        ...state,
        [field.target.name]: field.target.value,
      };
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await fetch("https://api.staticforms.xyz/submit", {
        method: "POST",
        body: JSON.stringify(contact),
        headers: { "Content-Type": "application/json" },
      });

      setContact((state) => ({
        ...state,
        name: "",
        email: "",
        message: "",
      }));

      toast.success("Contato enviado com sucesso!");
    } catch (e) {
      console.log(e);
      toast.error("Erro ao enviar contato");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="hidden"
        name="accessKey"
        value={process.env.NEXT_PUBLIC_STATIC_FORM_KEY}
      />
      <div>
        <label htmlFor="name">Nome</label>
        <input
          id="name"
          name="name"
          onChange={fillField}
          value={contact.name}
        />
      </div>
      <div>
        <label htmlFor="email">E-mail</label>
        <input
          id="email"
          name="email"
          onChange={fillField}
          value={contact.email}
        />
      </div>
      <div>
        <label htmlFor="message">Menssagem</label>
        <textarea
          id="message"
          name="message"
          onChange={fillField}
          value={contact.message}
        />
      </div>
      <input
        type="hidden"
        name="redirectTo"
        value={process.env.NEXT_PUBLIC_VERCEL_URL}
      />
      <button>Entrar em contato</button>
    </form>
  );
}
