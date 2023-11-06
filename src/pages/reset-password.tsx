import "../globals.css";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";

import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCustomTranslation } from '../utils/useTranlsation';
import { useModal } from "@/context/modalContext";
import axios from "axios";
import Contant from "../context/contant";

function ForgotPassword() {


  const router = useRouter();

  const token_id = router?.query?.id;
  //@ts-ignore
  const { showModal } = useModal();

  const { t } = useCustomTranslation();

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .required(t("no_password"))
        .min(8, t("min_password_length")),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), undefined], t("password_mismatch"))
        .required(t("required")),
    }),
    onSubmit: async () => {
      try {
        const formData = new FormData();
        formData.append('password', formik.values.password);
        //@ts-ignore
        formData.append('token_id', token_id);
        formData.append('action', 'reset_password_done');

        axios.post(Contant.API, formData)
          .then(response => {
            try {
              let data = response.data;
              if (data.success == true) {
                showModal(t("password_reset_email_sent_suucess"), 2);
                router.push("/login");
              }
              else {
                showModal(data?.message);
              }
            }
            catch (ex) {
              console.log(ex)
              showModal("something went wrong");
            }
          })
          .catch(error => {
            console.log(error)
            showModal("something went wrong");
          });
      }
      catch (ex) {
        console.log(ex)
        showModal("something went wrong");
      }
    },
  });

  return (
    <>
      <Head>
        <meta name="description" content="Forgot Passwors" />
        <title>{t("reset_password")}</title>
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
            {t("reset_password")}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="space-y-6 bg-white p-10 rounded-md shadow-md">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                {t("password")}
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                  className="custom-input-text"
                />
              </div>
              {formik.touched.password && formik.errors.password ? (
                <p className="my-2 text-sm text-red-600 dark:text-red-500">
                  {formik.errors.password}
                </p>
              ) : null}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {t("confirm_password")}
                </label>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword ? (
                  <p className="my-2 text-sm text-red-600 dark:text-red-500">
                    {formik.errors.confirmPassword}
                  </p>
                ) : null}
              </div>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={formik.values.confirmPassword}
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
