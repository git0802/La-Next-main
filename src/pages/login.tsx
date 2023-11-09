// Router
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { useCustomTranslation } from "../utils/useTranlsation";

// Formik
import { useFormik } from "formik";
import * as Yup from "yup";

// Context
import { useUserAuth } from "@/context/userAuthContext";
import { useModal } from "@/context/modalContext";
import { getSession, useSession } from "next-auth/react";
// For putting user details on DB
import { signIn } from "next-auth/react";

export default function Login() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useCustomTranslation();
  //@ts-ignore
  const { showModal } = useModal();
  //@ts-ignore
  const { user, logIn, register } = useUserAuth(); // get user from context

  const [redirect, setRedirect] = useState("home");
  //http://localhost:3000/quiz#OC7QS
  function processLogin() {
    router.push(redirect);
  }

  useEffect(() => {
    async function get_token_value() {
      const _Session = await getSession();
      if (_Session?.user?.email) {
        let data = await register(
          _Session?.user?.email,
          "",
          "other",
          JSON.stringify(_Session)
        );
        if (data.success == true) {
          let redirct_social = localStorage.getItem("redirct_social");
          if (
            redirct_social &&
            !redirct_social?.includes("login") &&
            !redirct_social?.includes("register")
          ) {
            setRedirect(redirct_social);
          }
        }
      }
    }
    get_token_value();
  }, [session]);

  // Redirect user if already logged in
  useEffect(() => {
    if (user) {
      if (session) {
        let redirct_social = localStorage.getItem("redirct_social");
        if (
          redirct_social &&
          !redirct_social?.includes("login") &&
          !redirct_social?.includes("register")
        ) {
          localStorage.setItem("redirct_social", "");
          setRedirect(redirct_social);
        }

        setTimeout(() => {
          processLogin();
        }, 500);
      } else {
        processLogin();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session]);

  // Formik
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email(t("invalid_email")).required(t("required")),
      password: Yup.string()
        .required(t("no_password"))
        .min(8, t("min_password_length")),
    }),
    onSubmit: async () => {
      try {
        const data = await logIn(formik.values.email, formik.values.password);
        try {
          if (data.success == true) {
            let url = localStorage.getItem("redirct");
            if (url && !url?.includes("login") && !url?.includes("register")) {
              localStorage.setItem("redirct", "");
              setRedirect(url);
            }
            processLogin();
          } else {
            showModal(data?.message);
          }
        } catch (ex) {
          showModal("something-went-wrong");
        }
      } catch (ex) {
        showModal("something-went-wrong");
      }
    },
  });

  return (
    <>
      <form
        className="flex min-h-full h-screen h-[100svh] w-screen flex-1 flex-col justify-center px-6 lg:px-8 bg-gray-100"
        onSubmit={formik.handleSubmit}
      >
        {session && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-white opacity-75">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-purple-500 rounded-full"></div>
          </div>
        )}

        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-4 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {t("welcome")}
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  {t("password")}
                </label>
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-blue-500 hover:text-blue-400"
                  >
                    {t("forgot_password")}
                  </Link>
                </div>
              </div>
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
            </div>
            {formik.touched.password && formik.errors.password ? (
              <p className="my-2 text-sm text-red-600 dark:text-red-500">
                {formik.errors.password}
              </p>
            ) : null}
            <div>
              <button type="submit" className="custom-button">
                {t("login")}
              </button>
            </div>

            <div className="pt-4">
              <div className="flex flex-row items-center text-center text-sm text-black font-normal">
                <hr className="flex-1" />
                <span className="flex-1 w-full py-1 px-4">
                  {t("or_continue_with")}
                </span>
                <hr className="flex-1" />
              </div>
              <div className="flex space-x-4 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    let _url = localStorage.getItem("redirct");
                    if (
                      _url &&
                      _url?.length >= 5 &&
                      !_url?.includes("login") &&
                      !_url?.includes("register")
                    ) {
                      localStorage.setItem("redirct_social", _url);
                    }
                    signIn("google", { redirect: false });
                  }}
                  className="custom-button-2"
                >
                  <Image
                    width={50}
                    height={50}
                    className="w-4 h-4"
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    loading="lazy"
                    alt="google logo"
                  />
                  <span>Google</span>
                </button>
                {/* <a
            href={`https://login.microsoftonline.com/ae91f1c5-597e-45c7-b984-088d1027ff42/oauth2/v2.0/logout?post_logout_redirect_uri=localhost:3000/auth/signout`}
          >
            Log out
          </a> */}
                {/* Microsoft button */}
                <button
                  type="button"
                  onClick={() => {
                    let _url = localStorage.getItem("redirct");
                    if (
                      _url &&
                      _url?.length >= 5 &&
                      !_url?.includes("login") &&
                      !_url?.includes("register")
                    ) {
                      localStorage.setItem("redirct_social", _url);
                    }
                    signIn("azure-ad", { redirect: false });
                  }}
                  className="custom-button-2"
                >
                  <Image
                    width={50}
                    height={50}
                    className="w-4 h-4"
                    src="https://learn.microsoft.com/en-us/azure/active-directory/develop/media/howto-add-branding-in-apps/ms-symbollockup_mssymbol_19.svg"
                    loading="lazy"
                    alt="microsoft logo"
                  />
                  <span>Microsoft</span>
                </button>
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            {t("dont_have_account")}{" "}
            <Link
              href="/register"
              className="font-semibold leading-6 text-blue-500 hover:text-blue-400"
            >
              {t("register")}
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}
