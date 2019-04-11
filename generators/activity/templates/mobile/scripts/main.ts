/*
 * @Author: <%= youName %>
 * @Date: <%= Date %>
 */
import '<%= stylePath %>'
import Vue from 'vue'
import axios from 'axios'
import {goPersonalPage} from '../../js/common/common'

new Vue({
    el: '#app',
    data: {},
    created () {

    },
    mounted () {

    },
    methods: {
        // 点击头像，进入个人主页
        goPersonalPage (id:number) {
            goPersonalPage(id)
        },
        // 点击关注按钮，关注主播
        attention (uid:number, index:number) {
            axios.get('***', {
                params: {
                    mid: uid
                }
            })
                .then(res => {
                    let _data = res.data
                    if (typeof _data === 'string') {
                        _data = JSON.parse(_data)
                    }
                    if (_data.errno === 0) {
                        // this.rankList[index].isFollow = true
                    } else {
                        console.log(_data.msg)
                    }
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }
})
