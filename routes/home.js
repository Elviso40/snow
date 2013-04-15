var Backbone = require('backbone')
_ = require('underscore')
, Models = require('../models')
, Views = require('../views')
, async = require('async')
, app = require('../app')
, Router = module.exports = Backbone.Router.extend({
    initialize: function() {
        var that = this

        app.cache = require('../app.cache')
        app.cache.reload()

        app.header = new Views.HeaderView();
        app.header.render();
    },

    home: function() {
        app.section(new Views.HomeView())
    },

    routes: {
        '': 'home',
        'books': 'books',
        'my/accounts': 'userAccounts',
        'my/orders': 'userOrders',
        'books/:book': 'book',
        'books/:book/new': 'createOrder',
        'my/withdraw/BTC': 'withdrawBTC',
        'my/deposit/BTC': 'depositBTC',
        'my/transactions': 'userTransactions',
        'my/transfer': 'transfer',
        'my/rippleout/:sid': 'rippleOut',
        '*path': 'routeNotFound'
    },

    error: function(error) {
        var view = new Views.ErrorView({
            error: error
        })
        app.section(view)
    },

    routeNotFound: function() {
        console.log('route not found for', window.location.hash)
        app.section(new Views.RouteNotFoundView(), true)
    },

    books: function() {
        var view = new Views.BooksView({
            collection: app.cache.books
        })
        app.section(view, true);
    },

    userAccounts: function() {
        console.log('route: user accounts');

        if (!app.authorize()) return;

        var collection = new Backbone.Collection();

        collection.fetch({
            url: app.api.url + '/private/accounts',
            headers: app.api.headers()
        });

        var view = new Views.UserAccountsView({ collection: collection });
        app.section(view, true);
    },

    userOrders: function() {
        console.log('route: user orders');

        if (!app.authorize()) return;

        var collection = new Models.OrderCollection();
        collection.fetch({
            url: app.api.url + '/orders',
            headers: app.api.headers()
        });

        var view = new Views.UserOrdersView({ collection: collection });
        app.section(view, true);
    },

    userTransactions: function() {
        if (!app.authorize()) return
        var collection = new Models.TransactionCollection()
        collection.fetch({
            url: app.api.url + '/accounts/transactions',
            headers: app.api.headers()
        })
        var view = new Views.UserTransactionsView({
            collection: collection
        })
        app.section(view, true)
    },

    transfer: function(security_id) {
        if (!app.authorize()) return

        var view = new Views.SendView({
            app: app,
            security_id: security_id || null
        })
        app.section(view, true)
    },

    book: function(pair) {
        var split = pair.split('_');

        var book = app.cache.books.fromPair(split[0], split[1]);

        if (!book) {
            throw new Error('no book found for ' + split[0] + ' and ' + split[1]);
        }

        book.get('depth').fetch({
            url: app.api.url + '/public/books/' + book.id + '/depth?grouped=0'
        });

        var view = new Views.BookView({
            model: book
         });

        app.section(view, true);
    },

    withdrawBTC: function() {
        if (!app.authorize()) return
        var view = new Views.WithdrawBTCView()
        app.section(view, true)
    },

    rippleOut: function(sid) {
        if (!app.authorize()) return
        var view = new Views.RippleOutView({
            securityId: sid
        })
        app.section(view, true)
    },

    depositBTC: function() {
        if (!app.authorize()) return

        var model = new Backbone.Model({
            address: null
        })

        model.fetch({
            url: app.api.url + '/private/deposit/BTC/address',
            headers: app.api.headers()
        })

        var view = new Views.DepositBTCView({ model: model })
        app.section(view, true)
    },

    createOrder: function(pair) {
        if (!app.authorize()) return;

        var split = pair.split('_');

        var book = app.cache.books.fromPair(split[0], split[1]);

        if (!book) {
            throw new Error('no book found for ' + split[0] + ' and ' + split[1]);
        }

        book.get('depth').fetch({
            url: app.api.url + '/public/books/' + book.id + '/depth?grouped=0'
        });

        var view = new Views.CreateOrderView({
            book: book
        });

        app.section(view, true);
    }
});

Backbone.$ = jQuery
