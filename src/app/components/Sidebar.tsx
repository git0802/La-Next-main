import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link';

// For logout button
import { useUserAuth } from '@/context/userAuthContext';
import { useRouter } from "next/router";

import { useCustomTranslation } from '../../utils/useTranlsation';

import ThemeToggleButton from '@/pages/ThemeToggleButton' // Theme toggle button always exists in this sidebar

import {
    Bars3Icon,
    XMarkIcon,
    ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'

import { NavigationItem } from '@/utils/types';
import Skeleton from './Skeleton';

function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ')
}

// Define the type for bottom navigation item (top nav is defined in the main page)
type SecondNavItem = {
    id: number;
    name: string;
    href: string;
    initial: string;
    current: boolean;
};

type SidebarProps = {
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    navigation?: NavigationItem[];
    secondNav?: SecondNavItem[];
    head?: String;
    subHead?: String;
    menuClick?: (i: number) => void;
    activeQuestion?: number;
    quizLink?: string;
};

export default function Sidebar({ sidebarOpen,
    setSidebarOpen,
    navigation,
    secondNav = [
        { id: 1, name: "home", href: "home", initial: "H", current: false },
        { id: 1, name: "create-a-quiz", href: "create-quiz", initial: "C", current: false },
        { id: 1, name: "your-quizzes", href: "your-quizzes", initial: "Q", current: false },
        { id: 1, name: "your-scores", href: "your-scores", initial: "S", current: false },
        { id: 1, name: "create-a-course", href: "create-course", initial: "C", current: false },
        { id: 1, name: "your-courses", href: "your-courses", initial: "Y", current: false },
    ],
    head,
    subHead,
    menuClick,
    activeQuestion,
    quizLink
}: SidebarProps) {

    const { t } = useCustomTranslation();

    //@ts-ignore
    const { logOut } = useUserAuth();
    const router = useRouter();

    return (
        <div className="relative z-50">
            {sidebarOpen && (
                <div className="fixed inset-y-0 left-0 flex max-w-xs z-50 bg-white">

                    {/* Close sidebar button (only on mobile for now) */}
                    <div className="absolute left-56 top-0 flex w-16 justify-center pt-5">

                        <a onClick={() => setSidebarOpen(false)}>
                            <span className="sr-only">Close sidebar</span>
                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                        </a>
                    </div>


                    <div className="flex px-6 flex-col gap-y-5 overflow-y-auto bg-indigo-600 dark:bg-gray-900 pb-2 w-72 ">
                        <div className="h-16 items-center pt-5">
                            <ThemeToggleButton />
                        </div>
                        <div className="text-s font-semibold leading-6 text-indigo-200">{head} {quizLink ?
                            (<Link href={((parseInt(quizLink.split(",")[0])) ? "your-score" : "edit-quiz") + "#" + quizLink.split(",")[0]}>
                                <button
                                    type="button"
                                    className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 float-right"
                                >
                                    {`${quizLink.split(",")[1]} ${t("out-of")} ${quizLink.split(",")[2]}`}
                                </button>
                            </Link>)
                            : ""} </div>

                        <nav className="flex flex-1 flex-col">
                            <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                {/* Top menu items, usually from API, so Skeleton while waiting */}
                                {(head && menuClick && navigation) &&
                                    <li key="nav-mob">
                                        {navigation.length == 0 ? <Skeleton lines={3} /> :
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {navigation.map((item) => (
                                                    <li key={item.id}>
                                                        <a
                                                            onClick={() => {
                                                                menuClick(item.id);
                                                                if (window.innerWidth <= 768) setSidebarOpen(false);
                                                            }}
                                                            className={classNames(
                                                                item.id === activeQuestion
                                                                    ? 'bg-indigo-700 text-white dark:bg-gray-800'
                                                                    : 'text-indigo-200 hover:text-white hover:bg-indigo-700 dark:text-gray-400 dark:hover:bg-gray-800',
                                                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold cursor-pointer'
                                                            )}
                                                        >
                                                            {(item.icon) ? <item.icon
                                                                className={classNames(
                                                                    item.id === activeQuestion ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                                                                    'h-6 w-6 shrink-0'
                                                                )}
                                                                aria-hidden="true"
                                                            /> : ""}
                                                            {item.name}

                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        }
                                        {(quizLink?.includes(",,")) && <Link href={`edit-quiz#${quizLink.split(",,")[1]}`}>
                                            <button
                                                type="button"
                                                className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 float-right"
                                            >
                                                {t("edit")}
                                            </button>
                                        </Link>}
                                    </li>
                                }
                                {/* Bottom navigation items*/}
                                <li>
                                    <div className="text-xs font-semibold leading-6 text-indigo-200">{subHead}</div>
                                    <ul role="list" className="-mx-2 mt-2 space-y-1">
                                        {secondNav.map((secondNav) => (
                                            <li key={secondNav.name}>
                                                <Link
                                                    href={secondNav.href}
                                                    className={classNames(
                                                        secondNav.current
                                                            ? 'bg-indigo-700 text-white dark:bg-gray-800'
                                                            : 'text-indigo-200 hover:text-white dark:text-gray-400 dark:hover:bg-gray-800 hover:bg-indigo-700',
                                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                                    )}
                                                >
                                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-500 dark:border-gray-700 dark:bg-gray-800 text-[0.625rem] font-medium text-white">
                                                        {secondNav.initial}
                                                    </span>
                                                    <span className="truncate">{t(secondNav.name)}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>

                                <li className="-mx-6 mt-auto">
                                    <a
                                        onClick={ () => logOut()}
                                        className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-indigo-700 dark:hover:bg-gray-800"
                                    >
                                        <ArrowLeftOnRectangleIcon className="h-8 w-8" aria-hidden="true" />
                                        <span className="sr-only">Logout</span>
                                        <span aria-hidden="true">Logout</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}

            {/* Static sidebar for desktop 
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
                
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 dark:bg-gray-900 px-6">
                    <div className="flex h-16 shrink-0 items-center">
                        <ThemeToggleButton />
                    </div>
                    <div className="text-s font-semibold leading-6 text-indigo-200">{head} {quizLink ? quizLink.includes(",") ?
                        (<Link href={((parseInt(quizLink.split(",")[0])) ? "your-score" : "edit-quiz") + "#" + quizLink.split(",")[0]}>
                            <button
                                type="button"
                                className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 float-right"
                            >
                                {`${quizLink.split(",")[1]} ${t("out-of")} ${quizLink.split(",")[2]}`}
                            </button>
                        </Link>)
                        :
                        (<Link href={`edit-quiz#${quizLink}`}>
                            <button
                                type="button"
                                className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 float-right"
                            >
                                {t("edit")}
                            </button>
                        </Link>) : ""} </div>
                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            {(head && menuClick && navigation) &&
                                <li key="nav-mob">
                                    {navigation.length == 0 ? <Skeleton lines={6} /> :
                                        <ul role="list" className="-mx-2 space-y-1">
                                            {navigation.map((item) => (
                                                <li key={item.name}>
                                                    <a
                                                        onClick={() => menuClick(item.id)}
                                                        className={classNames(
                                                            item.id === activeQuestion
                                                                ? 'bg-indigo-700 text-white dark:bg-gray-800'
                                                                : 'text-indigo-200 hover:text-white hover:bg-indigo-700 dark:text-gray-400 dark:hover:bg-gray-800',
                                                            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold cursor-pointer'
                                                        )}
                                                    >
                                                        {(item.icon) ? <item.icon
                                                            className={classNames(
                                                                item.id === activeQuestion ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                                                                'h-6 w-6 shrink-0'
                                                            )}
                                                            aria-hidden="true"
                                                        /> : ""}
                                                        {item.name}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>

                                    }

                                    {(quizLink?.includes(",,")) && <Link href={`edit-quiz#${quizLink.split(",,")[1]}`}>
                                        <button
                                            type="button"
                                            className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mt-3"
                                        >
                                            {t("edit-quiz")}
                                        </button>
                                    </Link>}
                                </li>
                            }
                            <li>
                                <div className="text-xs font-semibold leading-6 text-indigo-200">{subHead}</div>
                                <ul role="list" className="-mx-2 mt-2 space-y-1">
                                    {secondNav.map((secondNav) => (
                                        <li key={t(secondNav.name)}>
                                            <Link
                                                href={secondNav.href}
                                                className={classNames(
                                                    secondNav.current
                                                        ? 'bg-indigo-700 text-white'
                                                        : 'text-indigo-200 hover:text-white hover:bg-indigo-700 dark:hover:bg-gray-800',
                                                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold cursor-pointer'
                                                )}
                                            >
                                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-500 dark:border-gray-700 dark:bg-gray-800 text-[0.625rem] font-medium text-white">
                                                    {secondNav.initial}
                                                </span>
                                                <span className="truncate">{t(secondNav.name)}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li className="-mx-6 mt-auto">
                                <a
                                    onClick={async () => { await logOut(); router.push("/login"); }}
                                    className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-indigo-700 dark:hover:bg-gray-800"
                                >
                                    <ArrowLeftOnRectangleIcon className="h-8 w-8" aria-hidden="true" />
                                    <span className="sr-only">Logout</span>
                                    <span aria-hidden="true">Logout</span>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        */}
            {/* Mobile menu button */}
            <button type="button" className="fixed top-4 left-4 z-40" onClick={() => setSidebarOpen(true)}>
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
        </div >
    )
}
