define(['plugins/router', 'durandal/app'], function (router, app) {
    return {
        router: router,
        activate: function () {
            router.map([
                { route: '',            moduleId: 'viewmodels/list',    nav: true },
                { route: 'new',         moduleId: 'viewmodels/edit',    nav: true },
                { route: 'edit/:id',    moduleId: 'viewmodels/edit' }
            ]).buildNavigationModel();

            return router.activate();
        }
    };
});