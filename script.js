// 商品数据
const products = [
    {
        id: 1,
        name: '新疆哈密瓜',
        price: 25.8,
        unit: '个',
        description: '新疆特级哈密瓜，香甜多汁'
    },
    {
        id: 2,
        name: '泰国金枕榴莲',
        price: 39.9,
        unit: '斤',
        description: '泰国进口金枕榴莲，肉质饱满'
    },
    {
        id: 3,
        name: '智利车厘子',
        price: 68.0,
        unit: '斤',
        description: '智利JJ级车厘子，果径28-30mm'
    },
    {
        id: 4,
        name: '海南麒麟西瓜',
        price: 4.5,
        unit: '斤',
        description: '海南麒麟西瓜，皮薄多汁'
    }
];

let currentProduct = null;

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    
    // 表单提交事件
    document.getElementById('submitForm').addEventListener('submit', function(e) {
        e.preventDefault();
        submitOrder();
    });
});

// 渲染商品列表
function renderProducts() {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-header">
                <div class="product-name">${product.name}</div>
                <div class="product-price">¥${product.price}</div>
            </div>
            <div class="product-unit">单位: ${product.unit}</div>
            <div class="product-desc">${product.description}</div>
            <button class="buy-btn" onclick="showOrderForm(${product.id})">
                立即抢购
            </button>
        `;
        productsContainer.appendChild(productElement);
    });
}

// 显示订单表单
function showOrderForm(productId) {
    currentProduct = products.find(p => p.id === productId);
    
    document.getElementById('selectedProduct').textContent = 
        `${currentProduct.name} (¥${currentProduct.price}/${currentProduct.unit})`;
    
    document.getElementById('products').style.display = 'none';
    document.getElementById('orderForm').style.display = 'block';
}

// 取消订单
function cancelOrder() {
    document.getElementById('orderForm').style.display = 'none';
    document.getElementById('products').style.display = 'grid';
    document.getElementById('submitForm').reset();
    currentProduct = null;
}

// 提交订单到GitHub Issues
async function submitOrder() {
    const formData = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        product: currentProduct.name,
        price: currentProduct.price,
        unit: currentProduct.unit,
        quantity: document.getElementById('quantity').value,
        total: (currentProduct.price * document.getElementById('quantity').value).toFixed(2),
        timestamp: new Date().toISOString()
    };

    try {
        // 使用 GitHub Issues API 提交订单
        await submitToGitHub(formData);
        
        // 显示成功消息
        document.getElementById('orderForm').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
    } catch (error) {
        alert('提交失败，请稍后重试: ' + error.message);
    }
}

// 提交到GitHub Issues
async function submitToGitHub(orderData) {
    // 这里需要替换为你的GitHub仓库信息
    const GITHUB_USERNAME = 'YOUR_USERNAME';  // 替换为你的GitHub用户名
    const GITHUB_REPO = 'fruit-orders';       // 替换为你的仓库名
    const GITHUB_TOKEN = 'YOUR_TOKEN';        // 需要创建personal access token
    
    const title = `订单: ${orderData.name} - ${orderData.product}`;
    const body = `
## 客户信息
- **姓名:** ${orderData.name}
- **电话:** ${orderData.phone}
- **地址:** ${orderData.address}

## 订单详情
- **商品:** ${orderData.product}
- **单价:** ¥${orderData.price}/${orderData.unit}
- **数量:** ${orderData.quantity}
- **总价:** ¥${orderData.total}
- **下单时间:** ${new Date(orderData.timestamp).toLocaleString()}

## 状态
- [ ] 待处理
- [ ] 已联系
- [ ] 已配送
- [ ] 已完成
    `;

    const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/issues`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            body: body,
            labels: ['pending', 'fruit-order']
        })
    });

    if (!response.ok) {
        throw new Error('GitHub API请求失败');
    }

    return await response.json();
}