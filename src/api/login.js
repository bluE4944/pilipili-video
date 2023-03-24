import service from "@/utils/requst";
const BASE_URL = process.env.VUE_APP_API_BASE_URL;

    return service({
        url: `${BASE_URL}/login`,
        method: "post",
    });
}