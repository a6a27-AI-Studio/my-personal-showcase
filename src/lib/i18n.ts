// UI 繁體中文翻譯
export const zhTW = {
    // Navigation
    nav: {
        about: '關於我',
        skills: '技能',
        services: '服務',
        portfolio: '作品集',
        contact: '聯絡我',
        admin: '管理後台',
        logo: '個人官網',
    },

    // Auth
    auth: {
        switchRole: '切換角色',
        guest: '訪客',
        user: '使用者',
        admin: '管理員',
        logout: '登出',
    },

    // Common
    common: {
        loading: '載入中...',
        save: '儲存',
        cancel: '取消',
        delete: '刪除',
        edit: '編輯',
        create: '新增',
        back: '返回',
        search: '搜尋',
        filter: '篩選',
        clear: '清除',
        submit: '送出',
        downloadResume: '下載履歷',
        resumeNotAvailable: '履歷尚未提供',
    },

    // About Page
    about: {
        title: '關於我',
        highlights: '重點成就',
        links: '連結',
        noData: '找不到資料',
    },

    // Skills Page
    skills: {
        title: '技能',
        subtitle: '我的技術專長與工具熟練度',
        categories: {
            frontend: '前端開發',
            backend: '後端開發',
            devops: 'DevOps',
            database: '資料庫',
            tools: '工具',
            other: '其他',
        },
        noSkills: '尚無技能資料',
        allTags: '全部',
    },

    // Services Page
    services: {
        title: '服務',
        subtitle: '我提供的專業服務項目',
        deliverables: '交付成果',
        process: '流程',
        relatedProjects: '相關作品',
        noServices: '尚無服務項目',
    },

    // Portfolio Page
    portfolio: {
        title: '作品集',
        subtitle: '展示我最近的專案與解決的問題',
        search: '搜尋專案...',
        filterByTag: '依標籤篩選：',
        filterByTech: '依技術篩選：',
        clearFilters: '清除篩選',
        problem: '問題',
        solution: '解決方案',
        impact: '影響',
        techStack: '技術棧',
        tags: '標籤',
        links: '連結',
        status: '狀態',
        draft: '草稿',
        published: '已發布',
        noPortfolio: '尚無作品',
        noMatch: '沒有符合的專案',
    },

    // Contact Page
    contact: {
        title: '聯絡我',
        subtitle: '有專案想法？讓我們談談我能如何協助',
        getInTouch: '取得聯繫',
        description: '我隨時歡迎討論新專案、創意想法或合作機會',
        email: '電子郵件',
        phone: '電話',
        location: '地點',
        myMessages: '我的留言',
        newMessage: '新留言',
        subject: '主題（選填）',
        content: '內容',
        pleaseLogin: '請登入後留言。您的留言僅對您可見',
        loginAsUser: '以使用者身分登入',
        noMessages: '尚無留言。點擊「新留言」開始',
        saving: '儲存中...',
    },

    // Admin Pages
    admin: {
        dashboard: {
            title: '管理後台',
            subtitle: '管理您的網站內容',
            manageAbout: '管理關於我',
            aboutDesc: '編輯個人資訊、標題與連結',
            manageSkills: '管理技能',
            skillsDesc: '新增、編輯或刪除技能項目',
            manageServices: '管理服務',
            servicesDesc: '管理您提供的服務項目',
            managePortfolio: '管理作品集',
            portfolioDesc: '管理專案、草稿與已發布狀態',
            manageResume: '管理履歷',
            resumeDesc: '更新履歷版本與 PDF 連結',
        },

        about: {
            title: '編輯關於我',
            headline: '標題',
            subheadline: '副標題',
            bio: '簡介',
            highlights: '重點成就（每行一項）',
            links: '連結（格式：標籤: URL，每行一個）',
            avatarUrl: '頭像圖片 URL',
        },

        skills: {
            title: '管理技能',
            addSkill: '新增技能',
            editSkill: '編輯技能',
            name: '名稱',
            category: '類別',
            level: '等級',
            tags: '標籤（逗號分隔）',
            sortOrder: '排序',
            noSkills: '尚無技能。點擊「新增技能」建立',
        },

        services: {
            title: '管理服務',
            addService: '新增服務',
            editService: '編輯服務',
            name: '名稱',
            summary: '摘要',
            description: '描述',
            deliverables: '交付成果（每行一項）',
            process: '流程（每行一步）',
            relatedPortfolio: '相關作品 ID（逗號分隔）',
            sortOrder: '排序',
            noServices: '尚無服務。點擊「新增服務」建立',
        },

        portfolio: {
            title: '管理作品集',
            addProject: '新增專案',
            editProject: '編輯專案',
            title_field: '標題',
            slug: '網址名稱',
            summary: '摘要',
            coverImage: '封面圖片 URL',
            problem: '問題',
            solution: '解決方案',
            impact: '影響（每行一項）',
            tags: '標籤（逗號分隔）',
            techStack: '技術棧（逗號分隔）',
            links: '連結（格式：標籤: URL，每行一個）',
            status: '狀態',
            published: '已發布',
            draft: '草稿',
            publish: '發布',
            unpublish: '取消發布',
            moveUp: '上移',
            moveDown: '下移',
            noProjects: '尚無專案。點擊「新增專案」建立',
        },

        resume: {
            title: '管理履歷',
            version: '版本',
            pdfUrl: 'PDF URL',
            pdfUrlHelp: '留空將停用導航列的下載按鈕',
            lastUpdated: '最後更新',
        },
    },

    // Error Pages
    errors: {
        forbidden: {
            title: '403 - 禁止訪問',
            message: '您沒有權限訪問此頁面',
            description: '此區域僅限管理員訪問。請以管理員身分登入',
            backHome: '返回首頁',
        },
        notFound: {
            title: '404 - 找不到頁面',
            message: '此頁面不存在',
            backHome: '返回首頁',
        },
    },
};

// 英文翻譯（保留原文）
export const enUS = {
    nav: {
        about: 'About',
        skills: 'Skills',
        services: 'Services',
        portfolio: 'Portfolio',
        contact: 'Contact',
        admin: 'Admin',
        logo: 'Portfolio',
    },
    // ... 其他可以保持英文不翻譯
};

// 預設使用繁體中文
export const t = zhTW;
