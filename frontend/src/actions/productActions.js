import Axios from "axios"
import { PRODUCT_LIST_FAIL, PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS } from "../constants/productConstants"

//define actions
export const listProducts = () => async (dispatch) =>{
    dispatch ({
        type: PRODUCT_LIST_REQUEST
    })
    //fetching data from backend
    try {;
        const { data } = await Axios.get('/api/products');
        dispatch({
            type: PRODUCT_LIST_SUCCESS,
            payload: data
        })
    } catch (error) {
        dispatch({
            type: PRODUCT_LIST_FAIL,
            payload: error.message
        })
    }
}