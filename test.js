/*
 * @Author: 刘俊琪
 * @Date: 2022-04-11 17:49:56
 * @LastEditTime: 2022-04-13 15:07:35
 * @Description: 描述
 */
let arr = [
  { id: 0, name: "张三" },
  { id: 1, name: "李四" },
  { id: 2, name: "王五" },
  { id: 3, name: "赵六" },
  { id: 1, name: "孙七" },
  { id: 2, name: "周八" },
  { id: 2, name: "吴九" },
  { id: 3, name: "郑十" },
];

const removeDuplicateObj = (arr) => {
  let obj = {};
  arr = arr.reduce((newArr, next) => {
    obj[next.id] ? "" : (obj[next.id] = true && newArr.push(next));
    return newArr;
  }, []);
  return arr;
};

console.log(removeDuplicateObj(arr));
