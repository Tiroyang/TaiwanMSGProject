// src/components/about/AboutModal.jsx

import {
    useEffect,
    useState,
} from "react";

import {
    createPortal,
} from "react-dom";

import {
    CircleHelp,
    ExternalLink,
    FileWarning,
    Github,
    Heart,
    Info,
    Link2,
    MessageSquareText,
    MonitorCog,
    X,
    Funnel,
    CircleCheck,
    CircleX,
} from "lucide-react";

import {
    ABOUT_CONTENT,
} from "./aboutContent";


const TABS = [
    {
        key: "site",
        label: "關於網站",
        icon: Info,
    },
    {
        key: "author",
        label: "作者的話",
        icon: Heart,
    },
    {
        key: "links",
        label: "相關連結",
        icon: Link2,
    },
    {
        key: "feedback",
        label: "網站回報",
        icon: MessageSquareText,
    },
    {
        key: "website",
        label: "網站資訊",
        icon: MonitorCog,
    },
];


export default function AboutModal({
    open,
    onClose,
}) {
    const [
        activeTab,
        setActiveTab,
    ] = useState("site");

    useEffect(() => {
        if (!open) {
            return;
        }

        setActiveTab("site");

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        const previousHtmlOverflow =
            document.documentElement
                .style.overflow;

        const previousBodyOverflow =
            document.body.style.overflow;

        document.documentElement
            .style.overflow = "hidden";

        document.body.style.overflow =
            "hidden";

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );

            document.documentElement
                .style.overflow =
                previousHtmlOverflow;

            document.body.style.overflow =
                previousBodyOverflow;
        };
    }, [
        open,
        onClose,
    ]);

    if (!open) {
        return null;
    }

    return createPortal(
        <div
            className="
                fixed inset-0 z-[100]
                flex items-center justify-center
                bg-black/75
                p-4
                backdrop-blur-sm
            "
            onClick={onClose}
        >
            <div
                className="
                    flex
                    max-h-[88vh]
                    w-full max-w-4xl
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border border-slate-800
                    bg-slate-950
                    shadow-2xl
                "
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <AboutModalHeader
                    onClose={onClose}
                />

                <div className="
                    flex min-h-0 flex-1
                    flex-col
                    md:flex-row
                ">
                    <AboutTabs
                        activeTab={
                            activeTab
                        }
                        onChange={
                            setActiveTab
                        }
                    />

                    <main className="
                        min-h-0 flex-1
                        overflow-y-auto
                        p-5
                        sm:p-6
                    ">
                        <AboutTabContent
                            activeTab={
                                activeTab
                            }
                        />
                    </main>
                </div>
            </div>
        </div>,
        document.body
    );
}


function AboutModalHeader({
    onClose,
}) {
    return (
        <header className="
            flex shrink-0
            items-center justify-between
            border-b border-slate-800
            px-4 py-3
        ">
            <div className="
                flex items-center gap-2
                font-bold text-white text-xl
            ">
                <CircleHelp
                    size={24}
                    className="text-sky-400"
                />

                關於
            </div>

            <button
                type="button"
                onClick={onClose}
                className="
                    inline-flex h-9 w-9
                    items-center justify-center
                    rounded-xl
                    border border-slate-800
                    bg-slate-900/50
                    text-slate-300
                    transition
                    hover:bg-slate-800
                    hover:text-white
                "
                title="關閉"
            >
                <X size={18} />
            </button>
        </header>
    );
}


function AboutTabs({
    activeTab,
    onChange,
}) {
    return (
        <nav
            className="
                shrink-0
                overflow-x-auto
                border-b border-slate-800
                bg-slate-900/30
                md:w-[180px]
                md:overflow-visible
                md:border-b-0
                md:border-r
            "
        >
            <div className="
                flex min-w-max
                p-2
                md:min-w-0
                md:flex-col
            ">
                {TABS.map((tab) => {
                    const active =
                        activeTab ===
                        tab.key;

                    const Icon =
                        tab.icon;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => {
                                onChange(
                                    tab.key
                                );
                            }}
                            className={[
                                "flex items-center gap-2",
                                "rounded-lg px-3 py-2.5",
                                "text-left",
                                "transition",

                                active
                                    ? "bg-sky-600/15 text-sky-300"
                                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
                            ].join(" ")}
                        >
                            <Icon
                                size={20}
                                className="shrink-0"
                            />

                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}


function AboutTabContent({
    activeTab,
}) {
    switch (activeTab) {
        case "author":
            return <AuthorContent />;

        case "links":
            return <LinksContent />;

        case "feedback":
            return <FeedbackContent />;

        case "website":
            return <WebsiteContent />;

        case "site":
        default:
            return <SiteContent />;
    }
}


function SiteContent() {
    const data =
        ABOUT_CONTENT.site;

    return (
        <div className="space-y-6">
            <PageTitle
                title={data.title}
            />

            <ContentSection
                plain
            >
                <Paragraph>
                    {data.intro}
                </Paragraph>
            </ContentSection>

            <ContentSection
                title="這個網站是什麼？"
                icon={CircleCheck}
            >
                <BulletList
                    items={data.whatIs}
                />
            </ContentSection>

            <ContentSection
                title="這個網站不是什麼？"
                icon={CircleX}
            >
                <BulletList
                    items={
                        data.whatIsNot
                    }
                />
            </ContentSection>

            <ContentSection
                title="收錄標準"
                icon={Funnel}
            >
                <BulletList
                    items={
                        data.criteria
                    }
                />

            </ContentSection>

            <ContentSection
                title="注意事項"
                icon={FileWarning}
            >
                <BulletList
                    items={
                        data.notices
                    }
                />
            </ContentSection>
        </div>
    );
}


function AuthorContent() {
    const data =
        ABOUT_CONTENT.author;

    return (
        <div className="space-y-6">
            <PageTitle
                title={data.title}
            />

            <div className="space-y-5">
                {data.paragraphs.map(
                    (paragraph, index) => {
                        const isLast =
                            index ===
                            data.paragraphs.length - 1;

                        return (
                            <div key={index}>
                                {isLast && (
                                    <hr className="mb-2 border-0 border-t border-slate-400" />
                                )}

                                <Paragraph>
                                    {paragraph}
                                </Paragraph>
                            </div>
                        );
                    }
                )}
            </div>
        </div>
    );
}


function LinksContent() {
    const data =
        ABOUT_CONTENT.links;

    return (
        <div className="space-y-6">
            <PageTitle
                title={data.title}
            />

            <LinkList
                items={data.items}
            />
        </div>
    );
}


function FeedbackContent() {
    const data =
        ABOUT_CONTENT.feedback;

    return (
        <div className="space-y-6">
            <PageTitle
                title={data.title}
                description={data.description}
            />

            <LinkList
                items={data.items}
            />
        </div>
    );
}


function WebsiteContent() {
    const data =
        ABOUT_CONTENT.website;

    return (
        <div className="space-y-6">
            <PageTitle
                title={data.title}
            />

            <div className="
                overflow-hidden
                rounded-xl
                border border-slate-800
                bg-slate-900/40
            ">
                <InfoLine
                    label="版本"
                    value={
                        data.version
                    }
                />

                <InfoLine
                    label="更新時間"
                    value={
                        formatUpdateTime(
                            data.updatedAt
                        )
                    }
                />

                <InfoLine
                    label="網站狀態"
                    value={
                        data.status
                    }
                />
            </div>
        </div>
    );
}


function PageTitle({
    title,
    description,
}) {
    return (
        <div>
            <h2 className="
                text-xl font-bold
                text-white
            ">
                {title}
            </h2>

            {description && (
                <p className="
                    mt-2
                    text-sm leading-6
                    text-slate-400
                ">
                    {description}
                </p>
            )}
        </div>
    );
}


function ContentSection({
    title,
    icon: Icon,
    children,
    plain = false,
}) {
    return (
        <section
            className={
                plain
                    ? ""
                    : "rounded-xl border border-slate-800 bg-slate-900/40 p-4"
            }
        >
            {title && (
                <h3
                    className={[
                        "mb-3 flex items-center gap-2",
                        "text-base font-bold",
                        plain
                            ? "text-slate-200"
                            : "text-teal-400",
                    ].join(" ")}
                >
                    {Icon && (
                        <Icon size={15} />
                    )}

                    {title}
                </h3>
            )}

            {children}
        </section>
    );
}


function BulletList({
    items,
}) {
    return (
        <ul className="
            space-y-2
            text-[0.95rem] leading-6
            text-slate-300
        ">
            {items.map(
                (item, index) => (
                    <li
                        key={index}
                        className="
                            flex gap-2
                        "
                    >
                        <span className="
                            mt-[10px]
                            h-1 w-1
                            shrink-0
                            rounded-full
                            bg-sky-400
                        " />

                        <span>
                            {item}
                        </span>
                    </li>
                )
            )}
        </ul>
    );
}


function Paragraph({
    children,
}) {
    return (
        <p className="
            whitespace-pre-line
            text-[0.95rem] leading-6
            text-slate-300
        ">
            {children}
        </p>
    );
}


function LinkList({
    items,
}) {
    return (
        <div className="space-y-3">
            {items.map((item) => (
                <LinkCard
                    key={item.label}
                    {...item}
                />
            ))}
        </div>
    );
}


function LinkCard({
    label,
    description,
    url,
}) {
    const available =
        Boolean(url);

    if (!available) {
        return (
            <div className="
                flex items-center gap-3
                rounded-xl
                border border-slate-800
                bg-slate-900/40
                p-4
                opacity-60
            ">
                <ExternalLink
                    size={18}
                    className="
                        shrink-0
                        text-slate-500
                    "
                />

                <div className="min-w-0">
                    <div className="
                        font-semibold
                        text-slate-300
                    ">
                        {label}
                    </div>

                    <div className="
                        mt-1 text-sm
                        text-slate-500
                    ">
                        {description}
                    </div>
                </div>

                <span className="
                    ml-auto
                    shrink-0
                    text-xs text-slate-600
                ">
                    待補
                </span>
            </div>
        );
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="
                group
                flex items-center gap-3
                rounded-xl
                border border-slate-800
                bg-slate-900/40
                p-4
                transition
                hover:border-sky-500/40
                hover:bg-slate-800/50
            "
        >
            <ExternalLink
                size={18}
                className="
                    shrink-0
                    text-sky-400
                "
            />

            <div className="min-w-0">
                <div className="
                    font-semibold
                    text-slate-200
                    group-hover:text-white
                ">
                    {label}
                </div>

                <div className="
                    mt-1
                    text-sm
                    text-slate-500
                ">
                    {description}
                </div>
            </div>
        </a>
    );
}


function InfoLine({
    label,
    value,
}) {
    return (
        <div className="
            flex items-center
            justify-between gap-4
            border-b border-slate-800
            px-4 py-3
            last:border-b-0
        ">
            <span className="
                text-sm
                text-slate-500
            ">
                {label}
            </span>

            <span className="
                text-sm font-medium
                text-slate-200
            ">
                {value || "—"}
            </span>
        </div>
    );
}

function formatUpdateTime(
    value
) {
    if (!value) {
        return "—";
    }

    return new Date(
        value
    ).toLocaleString(
        "zh-TW",
        {
            timeZone:
                "Asia/Taipei",

            year: "numeric",
            month: "2-digit",
            day: "2-digit",

            hour12: false,
        }
    );
}