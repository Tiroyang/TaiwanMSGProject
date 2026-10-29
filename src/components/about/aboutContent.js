// src/components/about/aboutContent.js

import {
    APP_INFO,
} from "../../config/appInfo";

export const ABOUT_CONTENT = {
    site: {
        title: "關於網站",

        intro:
            "這是一個彙整台灣相關電影、影集與電子遊戲作品的資料網站，致力於建立一個便利、完整且易於探索的台灣作品目錄，未來將持續新增各種功能，敬請期待。",

        whatIs: [
            "收錄與台灣相關的影視作品，以及台灣製作的電子遊戲作品。",
            "定位為「作品導航目錄」，僅整理基本資料，以供進一步延伸搜尋。",
        ],

        whatIsNot: [
            "不是任何官方經營的影視或遊戲資料庫。",
            "不是新聞媒體、百科全書、影音平台或遊戲下載平台。",
            "網站資料不保證完全正確、完整或即時，請不要當做權威來源。",
        ],

        criteria: [
            "僅收錄已公開發行的台灣製作、國際合作、台灣取景或／和設定在台灣的影視作品。",
            "電影僅包含40分鐘以上長片，影集以單季為單位收錄。",
            "電子遊戲僅收錄台灣本土團隊製作的作品，且不包括大型電玩。",
        ],

        notices: [
            "網站資料皆為人工彙整，可能因來源落差或更新時間而存在錯誤。若發現資料有誤或遺漏，歡迎進行 [網站回報] 。",
            "作品名稱、劇照、海報、商標及其他相關權利均屬原權利人所有。本站僅作介紹與推廣使用，若有侵權請於 [網站回報] 告知。",
        ],
    },

    author: {
        title: "作者的話",

        paragraphs: [
            "我是一位深愛台灣影視和遊戲作品的創作者，我也十分喜歡推廣台灣優秀創作者的作品。",

            "然而各大影音、影評、百科或資料庫所中包含的台灣作品資料往往不完整，只能在各處找到零散的資訊，導致許多優秀的本土創作常常被忽略，非常可惜。",

            "最初，我僅僅只是蒐集台灣電影、影集、遊戲的預告片，將其彙集成一個Youtube撥放清單，方便使用Youtube的人能更輕鬆地接觸到這些作品，該列表目前也仍在龜速更新中，可見 [相關連結] 。",

            "雖然並不指望有多少人會看到，但後來隨著發現這些列表的觀看次數逐漸增加，我意識到這樣的一個資料整理對台灣作品的推廣可能有一定的實際幫助。",

            "然而，單靠依靠Youtube的播放清單並不足以提供完整的資料列表、瀏覽和搜尋功能，因此我決定進一步建立一個完整資料庫，並自行開發一個網頁來視覺化呈現這些資料。",

            "本計劃從2023年開始至今，從網頁架設到資料蒐集，皆由本人利用課餘時間完成。因此資料更新、功能新增與錯誤修正都需要時間調整，還請多多包涵。",
        ],
    },

    links: {
        title: "相關連結",

        items: [
            {
                label: "台灣電影列表 Taiwan Movie List （YouTube）",
                description: "本網站前身。僅包含時長超過60分鐘的台灣製作電影。",
                url: "https://www.youtube.com/playlist?list=PLh4a4i9E4dzR166Af6Vwcu-QhCQw6AXLg",
            },
            {
                label: "台灣影集列表 Taiwan Drama List （YouTube）",
                description:
                    "本網站前身。僅包含台灣製作的影集。",
                url: "https://www.youtube.com/playlist?list=PLh4a4i9E4dzR4QG5Uy0GUXi042ZU6XMbZ",
            },
            {
                label: "台灣遊戲列表 Taiwan Game List （YouTube）",
                description:
                    "本網站前身。僅包含台灣製作的電子遊戲，不包含街機。",
                url: "https://www.youtube.com/playlist?list=PLh4a4i9E4dzT5lr3D_8MFQc2h7byUJQHK",
            },
            {
                label: "取景或設定在台灣的外國影視作品列表 Films set or/and shot in Taiwan List （YouTube）",
                description:
                    "本網站前身。僅包含取景或/和設定在台灣的外國影視作品。",
                url: "https://www.youtube.com/playlist?list=PLh4a4i9E4dzT0RuvCrQgKZY46B1zrieKc",
            },
            {
                label: "Hololive成員玩台灣遊戲 （YouTube）",
                description:
                    "積極更新中。",
                url: "https://www.youtube.com/playlist?list=PLh4a4i9E4dzT2LMsI9wSzJmuIRQqsjh1M",
            },
        ],
    },

    feedback: {
        title: "網站回報",

        description: "發現資料有問題、作品遺漏、網站錯誤或想要許願新功能時，歡迎透過以下管道跟我連繫。",

        items: [
            {
                label: "資料錯誤／新增作品回報（Google 表單）",
                description:
                    "回報錯誤的資料、遺漏的作品或其他關於作品的問題。",
                url: "",
            },

            {
                label: "功能建議／網站錯誤回報（Google 表單）",
                description:
                    "網頁Bug回報、UI/UX意見反饋、新功能許願池或其他。",
                url: "",
            },

            {
                label: "GitHub",
                description:
                    "查看本站專案原始碼、提交 Issue 或發送 Pull Request。",
                url: "",
            },

            {
                label: "人員招募",
                description:
                    "若此網站紅了才可能計畫開放協助蒐集資料或維護網站。",
                url: "",
            },
        ],
    },

    website: {
        title: "網站資訊",

        version:
            APP_INFO.version,

        updatedAt:
            APP_INFO.updatedAt,

        status:
            APP_INFO.status,
    },
};
