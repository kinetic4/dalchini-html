import DashboardsIcon from 'assets/dualicons/dashboards.svg?react'
import OrderTimerIcon from 'assets/nav-icons/shopping-cart.svg?react'
import { NAV_TYPE_ROOT, NAV_TYPE_ITEM } from 'constants/app.constant'

export const dashboards = {
    id: 'dashboards',
    type: NAV_TYPE_ROOT,
    path: '/dashboards',
    title: 'Dashboards',
    transKey: 'nav.dashboards.dashboards',
    Icon: DashboardsIcon,
    childs: [
        {
            id: 'dashboards.orders',
            path: '/dashboards/orders',
            type: NAV_TYPE_ITEM,
            title: 'Orders',
            transKey: 'nav.dashboards.orders',
            Icon: OrderTimerIcon,
        }
    ]
}
