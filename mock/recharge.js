import Mock from 'mockjs';

Mock.mock('/recharge/info?packageId=0&platform=&version=0', {
    'errno': 0,
    'msg': '',
    'data|10': {
        nationCode: 'Indonesia',
        userInfo: {
            coin: 123456
        },
        payMethod: [
            {
                payName: 'Google Wallet',
                payLogoIcon: 1,
                pid: 1,
                discount: false,
                new: false,
                toggle: false,
                subProducts: [
                    {
                        money: '$0.99',
                        coin: 69,
                        bonusCoin: 0
                    },
                    {
                        money: '$4.99',
                        coin: 345,
                        bonusCoin: 0
                    },
                    {
                        money: '$9.99',
                        coin: 690,
                        bonusCoin: 0
                    },
                    {
                        money: '$49.99',
                        coin: 3450,
                        bonusCoin: 0
                    },
                    {
                        money: '$99.99',
                        coin: 6900,
                        bonusCoin: 0
                    },
                    {
                        money: '$299.99',
                        coin: 20700,
                        bonusCoin: 0
                    }
                ]
            },
            {
                payName: 'zGold MOL-Points wallet',
                payLogoIcon: 2,
                pid: 2,
                discount: false,
                new: false,
                toggle: false,
                subProducts: [
                    {
                        money: '$0.99',
                        coin: 69,
                        bonusCoin: 0
                    },
                    {
                        money: '$4.99',
                        coin: 345,
                        bonusCoin: 0
                    },
                    {
                        money: '$9.99',
                        coin: 690,
                        bonusCoin: 0
                    },
                    {
                        money: '$49.99',
                        coin: 3450,
                        bonusCoin: 0
                    },
                    {
                        money: '$99.99',
                        coin: 6900,
                        bonusCoin: 0
                    },
                    {
                        money: '$299.99',
                        coin: 20700,
                        bonusCoin: 0
                    }
                ]
            },
            {
                payName: 'zGold MOL-Points Direct',
                payLogoIcon: 3,
                pid: 3,
                discount: false,
                new: true,
                toggle: false,
                subProducts: [
                    {
                        money: '$0.99',
                        coin: 69,
                        bonusCoin: 0
                    },
                    {
                        money: '$4.99',
                        coin: 345,
                        bonusCoin: 0
                    },
                    {
                        money: '$9.99',
                        coin: 690,
                        bonusCoin: 0
                    },
                    {
                        money: '$49.99',
                        coin: 3450,
                        bonusCoin: 0
                    },
                    {
                        money: '$99.99',
                        coin: 6900,
                        bonusCoin: 0
                    },
                    {
                        money: '$299.99',
                        coin: 20700,
                        bonusCoin: 0
                    }
                ]
            },
            {
                payName: 'PaypalPay',
                payLogoIcon: 4,
                pid: 4,
                discount: true,
                new: false,
                toggle: false,
                subProducts: [
                    {
                        money: '$0.99',
                        coin: 69,
                        bonusCoin: 0
                    },
                    {
                        money: '$4.99',
                        coin: 345,
                        bonusCoin: 0
                    },
                    {
                        money: '$9.99',
                        coin: 690,
                        bonusCoin: 0
                    },
                    {
                        money: '$49.99',
                        coin: 3450,
                        bonusCoin: 0
                    },
                    {
                        money: '$99.99',
                        coin: 6900,
                        bonusCoin: 0
                    },
                    {
                        money: '$299.99',
                        coin: 20700,
                        bonusCoin: 0
                    }
                ]
            }
        ]
    }
});

Mock.mock('/user/CheckNoChargeUser?packageId=0',{
    'errno': 0,
    'msg': '',
    'data':{}
})
