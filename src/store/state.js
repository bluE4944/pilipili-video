import { Loading } from 'element-ui';
import * as types from './mutation-types';
import {isMobile} from "@/utils/utils";

const state={
    showLoading: true,
    isPc: !isMobile,
    loadingInstance: Loading.service(types.LOADIBG_OPTIONS)
}

export default state;