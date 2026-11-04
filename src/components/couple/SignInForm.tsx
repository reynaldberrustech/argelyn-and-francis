"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { signIn, type SignInState } from "@/app/guests/actions";

const initial: SignInState = { error: null };

/** The couple's password form. On success it goes straight to the guest list. */
export function SignInForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, initial);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const errorId = `${id}-error`;

  // After a wrong password, put the cursor back in the field.
  useEffect(() => {
    if (state.error) inputRef.current?.focus();
  }, [state]);

  return (
    <form action={formAction} className="signin">
      {/* Lets password managers save the login under a name. */}
      <input type="text" name="username" autoComplete="username" value="francis-and-argelyn" readOnly hidden />

      <div className="field">
        <label htmlFor={`${id}-password`}>Password</label>
        <div className="signin__password">
          <input
            ref={inputRef}
            id={`${id}-password`}
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            autoCapitalize="off"
            spellCheck={false}
            required
            maxLength={200}
            autoFocus={autoFocus}
            aria-invalid={state.error ? true : undefined}
            aria-describedby={state.error ? errorId : undefined}
          />
          <button
            type="button"
            className="signin__peek"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
          >
            {visible ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {state.error ? (
        <p id={errorId} className="reply-form__error" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" className="btn btn--ink" disabled={pending}>
        {pending ? "Checking…" : "Open the guest list"}
      </button>
    </form>
  );
}
