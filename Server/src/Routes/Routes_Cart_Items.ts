import express from 'express';
import {
    Add_Cart_item,
    Get_Cart_Items,
    Delete_Cart_Item,
    Update_Cart_Item_Quantity,
    Clear_Cart
} from '../Controller/Control_Cart_Items';

const router = express.Router();

router.post('/add_item', Add_Cart_item);
router.get('/get_cart_items', Get_Cart_Items);
router.delete('/delete_cart_item/:name', Delete_Cart_Item);
router.patch('/update_cart_quantity', Update_Cart_Item_Quantity);
router.delete('/clear_cart', Clear_Cart);

export default router;