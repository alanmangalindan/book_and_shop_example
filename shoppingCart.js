// Code adapted from CS719 UoA SQLiteNode Solutions - October 2018

// Load / Save Shopping Cart
// --------------------------------------------------------------------------
// Loads the shopping cart from sessions
function loadCart(req) {

    var cart = {};

    if (req.session.shoppingCart) {
        cart = req.session.shoppingCart;
    }

    return cart;
}

// Saves the shopping cart to cookies / sessions
function saveCart(cart, req, res) {
    req.session.shoppingCart = cart;
}

// Deletes the shopping cart from cookies / sessions
function deleteCart(req, res) {
    delete req.session.shoppingCart;
}

function updateCart(cart, itemId, newCount) {
    if (newCount > 0) {
        cart[itemId] = newCount;
    } else if (cart[itemId]) {
        delete cart[itemId];
    }
}
// --------------------------------------------------------------------------


// Exported methods
// --------------------------------------------------------------------------
module.exports.getCart = loadCart;

module.exports.clearCart = deleteCart;

module.exports.addItemToCart = function (req, res, itemId, count) {
    if (count > 0) {
        var cart = loadCart(req);

        if (cart[itemId]) {
            cart[itemId] += count;
        }
        else {
            cart[itemId] = count;
        }

        saveCart(cart, req, res);
    }
}

module.exports.setNumItemInCart = function (req, res, itemId, count) {
    var cart = loadCart(req);
    updateCart(cart, itemId, count);
    saveCart(cart, req, res);
}

module.exports.setNumItemsInCart = function (req, res, updateInfo) {
    var cart = loadCart(req);
    for (var i = 0; i < updateInfo.length; i++) {
        updateCart(cart, updateInfo[i].itemId, updateInfo[i].count);
    }
    saveCart(cart, req, res);
};
// --------------------------------------------------------------------------