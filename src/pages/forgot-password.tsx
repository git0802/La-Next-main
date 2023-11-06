import "../globals.css";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";

import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { sendPasswordResetEmail } from "firebase/auth";
import auth from "../utils/firebase.config";
import { useCustomTranslation } from '../utils/useTranlsation';
import { useModal } from "@/context/modalContext";

function ForgotPassword() {

  //@ts-ignore
  const { showModal } = useModal();

  const { t } = useCustomTranslation();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email(t("invalid_email")).required(t("required")),
    }),
    onSubmit: async () => {
      try {
        await sendPasswordResetEmail(auth, formik.values.email);
        showModal(t("password_reset_email_sent"), 2);
      } catch (error) {
        //@ts-ignore
        showModal(error.message.split("(")[1].split(")")[0]);
      }
    },
  });

  return (
    <>
      <Head>
        <meta name="description" content="Forgot Passwors" />
        <title>{t("forgot_password")}</title>
      </Head>
      <form
        className="flex min-h-full h-screen w-screen flex-1 flex-col justify-center px-6 lg:px-8 bg-gray-100"
        onSubmit={formik.handleSubmit}
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Image
            className="mx-auto h-20 w-auto"
            src="https://www.svgrepo.com/show/529279/user-circle.svg"
            alt="user profile logo"
            width={80}
            height={80}
          />
          <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {t("forgot_password")}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="space-y-6 bg-white p-10 rounded-md shadow-md">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t("email_address")}
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  className="custom-input-text"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="custom-button"
              >
                {t("reset-password")}
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            {t("got-your-password")}?{" "}
            <Link
              href="/login"
              className="font-semibold leading-6 text-blue-500 hover:text-blue-400"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}

export default ForgotPassword;
