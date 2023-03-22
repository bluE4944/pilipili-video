import service from "@/utils/requst";
const BASE_URL = process.env.VUE_APP_API_BASE_URL;

export function login(user) {
    return service({
        url: `${BASE_URL}/login`,
        method: "post",
        data: user
    });
}