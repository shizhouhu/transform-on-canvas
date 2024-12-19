import {Matrix} from "ml-matrix";

export const drawRect = (
    x: number,
    y: number,
    width: number,
    height: number,
    lineWidth: number,
    strokeStyle: string,
    fill: boolean,
    fillStyle: string,
    ctx: CanvasRenderingContext2D,
) => {
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + width, y)
    ctx.lineTo(x + width, y + height)
    ctx.lineTo(x, y + height)
    ctx.closePath()
    ctx.stroke()
    if (fill) {
        ctx.fillStyle = fillStyle
        ctx.fill()
    }
}

export const drawRect2 = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
    lineWidth: number,
    strokeStyle: string,
    fill: boolean,
    fillStyle: string,
    ctx: CanvasRenderingContext2D,
) => {
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.lineTo(x4, y4)
    ctx.closePath()
    ctx.stroke()
    if (fill) {
        ctx.fillStyle = fillStyle
        ctx.fill()
    }
}

export const drawRect3 = (points: Matrix[], lineWidth: number,
                          strokeStyle: string,
                          fill: boolean,
                          fillStyle: string,
                          ctx: CanvasRenderingContext2D) => {
    if (points.length < 2) {
        return
    }
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle
    ctx.beginPath()
    ctx.moveTo(points[0].get(0, 0), points[0].get(1, 0))
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].get(0, 0), points[i].get(1, 0))
    }
    ctx.closePath()
    ctx.stroke()
    if (fill) {
        ctx.fillStyle = fillStyle
        ctx.fill()
    }
}

export const drawCircle = (
    centerX: number,
    centerY: number,
    radius: number,
    lineWidth: number,
    strokeStyle: string,
    fill: boolean,
    fillStyle: string,
    ctx: CanvasRenderingContext2D,
) => {
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()
    if (fill) {
        ctx.fillStyle = fillStyle
        ctx.fill()
    }
}

export const drawPath = (
    path: string,
    transX: number,
    transY: number,
    ctx: CanvasRenderingContext2D,
) => {
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1
    ctx.fillStyle = '#CCCCCC'
    let path2D = new Path2D(path)
    let path2DNew = new Path2D()
    let m = new DOMMatrix()
    m.a = 1
    m.b = 0
    m.c = 0
    m.d = 1
    m.e = transX
    m.f = transY
    path2DNew.addPath(path2D, m)
    ctx.stroke(path2DNew)
    ctx.fill(path2DNew)
}

export function getRandomColor() {
    const r = Math.round(Math.random() * 255)
    const g = Math.round(Math.random() * 255)
    const b = Math.round(Math.random() * 255)
    return `rgb(${r},${g},${b})`
}

export function setColorHash(rects: Rect[], colorsHash: Map<string, Rect>) {
    rects.forEach(rect => {
        for (; ;) {
            const colorKey = getRandomColor()
            if (!colorsHash.get(colorKey)) {
                rect.colorKey = colorKey
                colorsHash.set(colorKey, rect)
                return
            }
        }
    })
}

export function drawAnchor(
    x: number,
    y: number,
    radius: number,
    ctx: CanvasRenderingContext2D,
) {
    ctx.strokeStyle = `#ffffff`
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.fill()
}

export function calcAngleDegrees(x: number, y: number) {
    let degree = (Math.atan2(y, x) * 180) / Math.PI
    return degree < 0 ? degree + 360 : degree
}

export const canvasWidth = 1280
export const canvasHeight = 720
export const buttonWidth = 28
export const buttonHeight = 28
export const buttonImageOffsetX = 4
export const buttonImageOffsetY = 8
export const buttonImageOffsetStep = 28
export const cropPath =
    'M14.3743 13.1224V5.8724C14.3743 5.81684 14.3466 5.76128 14.291 5.70573C14.2355 5.65017 14.1799 5.6224 14.1243 5.6224H6.87435V4.3724H14.1243C14.541 4.3724 14.8952 4.51823 15.1868 4.8099C15.4785 5.10156 15.6243 5.45573 15.6243 5.8724V13.1224H14.3743ZM14.9993 18.9557C14.8188 18.9557 14.6693 18.8968 14.551 18.7791C14.4332 18.6607 14.3743 18.5113 14.3743 18.3307V15.6224H5.87435C5.45768 15.6224 5.10352 15.4766 4.81185 15.1849C4.52018 14.8932 4.37435 14.5391 4.37435 14.1224V5.6224H1.66602C1.48546 5.6224 1.33602 5.56323 1.21768 5.4449C1.0999 5.32712 1.04102 5.17795 1.04102 4.9974C1.04102 4.81684 1.0999 4.66767 1.21768 4.5499C1.33602 4.43156 1.48546 4.3724 1.66602 4.3724H4.37435V1.66406C4.37435 1.48351 4.43352 1.33406 4.55185 1.21573C4.66963 1.09795 4.81879 1.03906 4.99935 1.03906C5.1799 1.03906 5.32907 1.09795 5.44685 1.21573C5.56518 1.33406 5.62435 1.48351 5.62435 1.66406V14.1224C5.62435 14.178 5.65213 14.2335 5.70768 14.2891C5.76324 14.3446 5.81879 14.3724 5.87435 14.3724H18.3327C18.5132 14.3724 18.6627 14.4313 18.781 14.5491C18.8988 14.6674 18.9577 14.8168 18.9577 14.9974C18.9577 15.178 18.8988 15.3274 18.781 15.4457C18.6627 15.5635 18.5132 15.6224 18.3327 15.6224H15.6243V18.3307C15.6243 18.5113 15.5655 18.6607 15.4477 18.7791C15.3293 18.8968 15.1799 18.9557 14.9993 18.9557Z'
export const pinpPath =
    'M10.0487 10.7051H15.0808C15.2955 10.7051 15.4747 10.6333 15.6184 10.4896C15.7621 10.3459 15.834 10.1666 15.834 9.9519V6.58652C15.834 6.37177 15.7621 6.19255 15.6184 6.04885C15.4747 5.90516 15.2955 5.83331 15.0808 5.83331H10.0487C9.83396 5.83331 9.65474 5.90516 9.51105 6.04885C9.36735 6.19255 9.29551 6.37177 9.29551 6.58652V9.9519C9.29551 10.1666 9.36735 10.3459 9.51105 10.4896C9.65474 10.6333 9.83396 10.7051 10.0487 10.7051ZM3.5904 16.25C3.16946 16.25 2.81315 16.1041 2.52148 15.8125C2.22982 15.5208 2.08398 15.1645 2.08398 14.7435V5.25642C2.08398 4.83547 2.22982 4.47917 2.52148 4.1875C2.81315 3.89583 3.16946 3.75 3.5904 3.75H16.4109C16.8318 3.75 17.1881 3.89583 17.4798 4.1875C17.7714 4.47917 17.9173 4.83547 17.9173 5.25642V14.7435C17.9173 15.1645 17.7714 15.5208 17.4798 15.8125C17.1881 16.1041 16.8318 16.25 16.4109 16.25H3.5904ZM3.5904 15H16.4109C16.4857 15 16.5471 14.9759 16.5952 14.9279C16.6433 14.8798 16.6673 14.8183 16.6673 14.7435V5.25642C16.6673 5.18162 16.6433 5.12019 16.5952 5.0721C16.5471 5.02402 16.4857 4.99998 16.4109 4.99998H3.5904C3.51561 4.99998 3.45417 5.02402 3.40609 5.0721C3.35801 5.12019 3.33396 5.18162 3.33396 5.25642V14.7435C3.33396 14.8183 3.35801 14.8798 3.40609 14.9279C3.45417 14.9759 3.51561 15 3.5904 15ZM10.5455 9.45512V7.08329H14.584V9.45512H10.5455Z'
export const rotateRightPath =
    'M16.3132 10.0417C16.1882 10.0417 16.0668 9.99639 15.949 9.90583C15.8307 9.81583 15.7507 9.70139 15.709 9.5625C15.6395 9.24306 15.5423 8.93389 15.4173 8.635C15.2923 8.33667 15.1465 8.04861 14.9798 7.77083C14.8965 7.65972 14.8654 7.53139 14.8865 7.38583C14.907 7.23972 14.9659 7.11806 15.0632 7.02083C15.2159 6.88194 15.3929 6.82278 15.594 6.84333C15.7957 6.86444 15.9451 6.95833 16.0423 7.125C16.2507 7.45833 16.4312 7.80194 16.584 8.15583C16.7368 8.51028 16.8548 8.88194 16.9382 9.27083C16.9937 9.47917 16.959 9.65972 16.834 9.8125C16.709 9.96528 16.5354 10.0417 16.3132 10.0417ZM10.8757 17.1458C10.8757 17.0069 10.9209 16.8783 11.0115 16.76C11.1015 16.6422 11.2159 16.5694 11.3548 16.5417C11.6743 16.4722 11.9834 16.375 12.2823 16.25C12.5807 16.125 12.8687 15.9792 13.1465 15.8125C13.2576 15.7292 13.3862 15.6978 13.5323 15.7183C13.6779 15.7394 13.7993 15.7986 13.8965 15.8958C14.0354 16.0486 14.0945 16.2222 14.074 16.4167C14.0529 16.6111 13.959 16.7639 13.7923 16.875C13.459 17.0833 13.1118 17.2603 12.7507 17.4058C12.3895 17.5519 12.0215 17.6736 11.6465 17.7708C11.4382 17.8264 11.2576 17.7917 11.1048 17.6667C10.952 17.5417 10.8757 17.3681 10.8757 17.1458ZM15.0632 14.7292C14.9659 14.6458 14.907 14.5278 14.8865 14.375C14.8654 14.2222 14.8965 14.0903 14.9798 13.9792C15.1465 13.7014 15.2923 13.4131 15.4173 13.1142C15.5423 12.8158 15.6395 12.5069 15.709 12.1875C15.7507 12.0486 15.827 11.9339 15.9382 11.8433C16.0493 11.7533 16.1743 11.7083 16.3132 11.7083C16.5354 11.7083 16.709 11.7847 16.834 11.9375C16.959 12.0903 16.9937 12.2708 16.9382 12.4792C16.8548 12.8542 16.7404 13.2189 16.5948 13.5733C16.4487 13.9272 16.2645 14.2778 16.0423 14.625C15.9451 14.7917 15.7957 14.8856 15.594 14.9067C15.3929 14.9272 15.2159 14.8681 15.0632 14.7292ZM8.45898 17.7708C6.86176 17.3819 5.54593 16.5519 4.51148 15.2808C3.47648 14.0103 2.95898 12.5417 2.95898 10.875C2.95898 8.90278 3.64648 7.22917 5.02148 5.85417C6.39648 4.47917 8.0701 3.79167 10.0423 3.79167H10.4173L9.33398 2.70833C9.20898 2.58333 9.14648 2.43389 9.14648 2.26C9.14648 2.08667 9.21593 1.9375 9.35482 1.8125C9.46593 1.6875 9.60843 1.625 9.78232 1.625C9.95565 1.625 10.1048 1.6875 10.2298 1.8125L12.3132 3.89583C12.3826 3.96528 12.4348 4.045 12.4698 4.135C12.5043 4.22556 12.5215 4.31944 12.5215 4.41667C12.5215 4.51389 12.5043 4.6075 12.4698 4.6975C12.4348 4.78806 12.3826 4.86806 12.3132 4.9375L10.2298 7.02083C10.1048 7.14583 9.95565 7.20833 9.78232 7.20833C9.60843 7.20833 9.46593 7.14583 9.35482 7.02083C9.22982 6.89583 9.16732 6.75 9.16732 6.58333C9.16732 6.41667 9.22982 6.27083 9.35482 6.14583L10.459 5.04167H10.0423C8.41732 5.04167 7.03898 5.60778 5.90732 6.74C4.7751 7.87167 4.20898 9.25 4.20898 10.875C4.20898 12.25 4.6326 13.4619 5.47982 14.5108C6.32704 15.5592 7.41037 16.2361 8.72982 16.5417C8.86871 16.5833 8.98343 16.6597 9.07398 16.7708C9.16398 16.8819 9.20898 17.0069 9.20898 17.1458C9.20898 17.3681 9.13621 17.5417 8.99065 17.6667C8.84454 17.7917 8.66732 17.8264 8.45898 17.7708Z'
export const flipHorizontal =
    'M4.83398 16.9193C4.41732 16.9193 4.06315 16.7734 3.77148 16.4818C3.47982 16.1901 3.33398 15.8359 3.33398 15.4193V4.2526C3.33398 3.83594 3.47982 3.48177 3.77148 3.1901C4.06315 2.89844 4.41732 2.7526 4.83398 2.7526H7.50065C7.68121 2.7526 7.83065 2.81149 7.94898 2.92927C8.06676 3.0476 8.12565 3.19705 8.12565 3.3776C8.12565 3.55816 8.06676 3.70733 7.94898 3.8251C7.83065 3.94344 7.68121 4.0026 7.50065 4.0026H4.83398C4.76454 4.0026 4.70565 4.02705 4.65732 4.07594C4.60843 4.12427 4.58398 4.18316 4.58398 4.2526V15.4193C4.58398 15.4887 4.60843 15.5479 4.65732 15.5968C4.70565 15.6451 4.76454 15.6693 4.83398 15.6693H7.50065C7.68121 15.6693 7.83065 15.7282 7.94898 15.8459C8.06676 15.9643 8.12565 16.1137 8.12565 16.2943C8.12565 16.4748 8.06676 16.6243 7.94898 16.7426C7.83065 16.8604 7.68121 16.9193 7.50065 16.9193H4.83398ZM10.4173 19.0026C10.2368 19.0026 10.0876 18.9437 9.96982 18.8259C9.85148 18.7076 9.79232 18.5582 9.79232 18.3776V1.46094C9.79232 1.28038 9.85148 1.13094 9.96982 1.0126C10.0876 0.894826 10.2368 0.835938 10.4173 0.835938C10.5979 0.835938 10.7473 0.894826 10.8657 1.0126C10.9834 1.13094 11.0423 1.28038 11.0423 1.46094V18.3776C11.0423 18.5582 10.9834 18.7076 10.8657 18.8259C10.7473 18.9437 10.5979 19.0026 10.4173 19.0026ZM16.2507 4.0026H16.084V2.7526H16.2507C16.5979 2.7526 16.8929 2.87427 17.1357 3.1176C17.379 3.36038 17.5007 3.65538 17.5007 4.0026V4.16927H16.2507V4.0026ZM16.2507 10.6068V9.0651H17.5007V10.6068H16.2507ZM16.2507 16.9193H16.084V15.6693H16.2507V15.5026H17.5007V15.6693C17.5007 16.0165 17.379 16.3115 17.1357 16.5543C16.8929 16.7976 16.5979 16.9193 16.2507 16.9193ZM16.2507 7.39844V5.83594H17.5007V7.39844H16.2507ZM16.2507 13.8359V12.2734H17.5007V13.8359H16.2507ZM12.709 16.9193V15.6693H14.4173V16.9193H12.709ZM12.709 4.0026V2.7526H14.4173V4.0026H12.709Z'
export const flipVertical =
    'M17.4173 15.5C17.4173 15.9167 17.2715 16.2708 16.9798 16.5625C16.6882 16.8542 16.334 17 15.9173 17H4.75065C4.33398 17 3.97982 16.8542 3.68815 16.5625C3.39648 16.2708 3.25065 15.9167 3.25065 15.5V12.8333C3.25065 12.6528 3.30954 12.5033 3.42732 12.385C3.54565 12.2672 3.6951 12.2083 3.87565 12.2083C4.05621 12.2083 4.20537 12.2672 4.32315 12.385C4.44148 12.5033 4.50065 12.6528 4.50065 12.8333V15.5C4.50065 15.5694 4.5251 15.6283 4.57398 15.6767C4.62232 15.7256 4.68121 15.75 4.75065 15.75H15.9173C15.9868 15.75 16.0459 15.7256 16.0948 15.6767C16.1432 15.6283 16.1673 15.5694 16.1673 15.5V12.8333C16.1673 12.6528 16.2262 12.5033 16.344 12.385C16.4623 12.2672 16.6118 12.2083 16.7923 12.2083C16.9729 12.2083 17.1223 12.2672 17.2407 12.385C17.3584 12.5033 17.4173 12.6528 17.4173 12.8333V15.5ZM19.5007 9.91667C19.5007 10.0972 19.4418 10.2464 19.324 10.3642C19.2057 10.4825 19.0562 10.5417 18.8757 10.5417H1.95898C1.77843 10.5417 1.62898 10.4825 1.51065 10.3642C1.39287 10.2464 1.33398 10.0972 1.33398 9.91667C1.33398 9.73611 1.39287 9.58667 1.51065 9.46833C1.62898 9.35055 1.77843 9.29167 1.95898 9.29167H18.8757C19.0562 9.29167 19.2057 9.35055 19.324 9.46833C19.4418 9.58667 19.5007 9.73611 19.5007 9.91667ZM4.50065 4.08333V4.25H3.25065V4.08333C3.25065 3.73611 3.37232 3.44111 3.61565 3.19833C3.85843 2.955 4.15343 2.83333 4.50065 2.83333H4.66732V4.08333H4.50065ZM11.1048 4.08333H9.56315V2.83333H11.1048V4.08333ZM17.4173 4.08333V4.25H16.1673V4.08333H16.0006V2.83333H16.1673C16.5145 2.83333 16.8095 2.955 17.0523 3.19833C17.2957 3.44111 17.4173 3.73611 17.4173 4.08333ZM7.89648 4.08333H6.33398V2.83333H7.89648V4.08333ZM14.334 4.08333H12.7715V2.83333H14.334V4.08333ZM17.4173 7.625H16.1673V5.91667H17.4173V7.625ZM4.50065 7.625H3.25065V5.91667H4.50065L4.50065 7.625Z'
export const backPath =
    'M9.2487 15.9176L3.8737 10.5218C3.79036 10.4523 3.73148 10.3723 3.69703 10.2818C3.66203 10.1918 3.64453 10.0981 3.64453 10.0009C3.64453 9.9037 3.66203 9.80981 3.69703 9.71926C3.73148 9.62926 3.79036 9.54953 3.8737 9.48009L9.2487 4.08426C9.3737 3.97315 9.51953 3.91398 9.6862 3.90676C9.85286 3.90009 9.9987 3.95926 10.1237 4.08426C10.2487 4.20926 10.3145 4.35509 10.3212 4.52176C10.3284 4.68842 10.2695 4.8412 10.1445 4.98009L5.72786 9.37592H15.4154C15.582 9.37592 15.7279 9.43481 15.8529 9.55259C15.9779 9.67092 16.0404 9.82037 16.0404 10.0009C16.0404 10.1815 15.9779 10.3306 15.8529 10.4484C15.7279 10.5668 15.582 10.6259 15.4154 10.6259H5.72786L10.1445 15.0426C10.2556 15.1537 10.3145 15.2959 10.3212 15.4693C10.3284 15.6431 10.2695 15.7926 10.1445 15.9176C10.0195 16.0426 9.87036 16.1051 9.69703 16.1051C9.52314 16.1051 9.3737 16.0426 9.2487 15.9176Z'
export const donePath =
    'M7.95926 14.3932C7.86203 14.3932 7.76842 14.3757 7.67842 14.3407C7.58787 14.3063 7.50787 14.2543 7.43842 14.1849L3.95926 10.7057C3.83426 10.5807 3.77509 10.4313 3.78176 10.2574C3.78898 10.0841 3.84815 9.9349 3.95926 9.8099C4.08426 9.6849 4.2337 9.6224 4.40759 9.6224C4.58092 9.6224 4.72315 9.6849 4.83426 9.8099L7.95926 12.9349L15.1676 5.72656C15.2787 5.60156 15.4245 5.53906 15.6051 5.53906C15.7856 5.53906 15.9315 5.60156 16.0426 5.72656C16.1676 5.85156 16.2301 6.00073 16.2301 6.17406C16.2301 6.34795 16.1676 6.4974 16.0426 6.6224L8.48009 14.1849C8.41065 14.2543 8.33092 14.3063 8.24092 14.3407C8.15037 14.3757 8.05648 14.3932 7.95926 14.3932Z'
export const pinpRightTopPath =
    'M10.0468 10.7051H15.0788C15.2936 10.7051 15.4728 10.6333 15.6165 10.4896C15.7602 10.3459 15.832 10.1666 15.832 9.9519V6.58652C15.832 6.37177 15.7602 6.19255 15.6165 6.04885C15.4728 5.90516 15.2936 5.83331 15.0788 5.83331H10.0468C9.83201 5.83331 9.65279 5.90516 9.50909 6.04885C9.3654 6.19255 9.29355 6.37177 9.29355 6.58652V9.9519C9.29355 10.1666 9.3654 10.3459 9.50909 10.4896C9.65279 10.6333 9.83201 10.7051 10.0468 10.7051ZM3.58845 16.25C3.1675 16.25 2.8112 16.1041 2.51953 15.8125C2.22786 15.5208 2.08203 15.1645 2.08203 14.7435V5.25642C2.08203 4.83547 2.22786 4.47917 2.51953 4.1875C2.8112 3.89583 3.1675 3.75 3.58845 3.75H16.4089C16.8299 3.75 17.1862 3.89583 17.4778 4.1875C17.7695 4.47917 17.9153 4.83547 17.9153 5.25642V14.7435C17.9153 15.1645 17.7695 15.5208 17.4778 15.8125C17.1862 16.1041 16.8299 16.25 16.4089 16.25H3.58845ZM3.58845 15H16.4089C16.4837 15 16.5451 14.9759 16.5932 14.9279C16.6413 14.8798 16.6653 14.8183 16.6653 14.7435V5.25642C16.6653 5.18162 16.6413 5.12019 16.5932 5.0721C16.5451 5.02402 16.4837 4.99998 16.4089 4.99998H3.58845C3.51366 4.99998 3.45222 5.02402 3.40414 5.0721C3.35605 5.12019 3.33201 5.18162 3.33201 5.25642V14.7435C3.33201 14.8183 3.35605 14.8798 3.40414 14.9279C3.45222 14.9759 3.51366 15 3.58845 15ZM10.5435 9.45512V7.08329H14.582V9.45512H10.5435Z'
export const pinpLeftTopPath =
    'M9.95324 10.7051H4.9212C4.70645 10.7051 4.52722 10.6333 4.38353 10.4896C4.23983 10.3459 4.16799 10.1666 4.16799 9.9519V6.58652C4.16799 6.37177 4.23983 6.19255 4.38353 6.04885C4.52722 5.90516 4.70645 5.83331 4.9212 5.83331H9.95324C10.168 5.83331 10.3472 5.90516 10.4909 6.04885C10.6346 6.19255 10.7064 6.37177 10.7064 6.58652V9.9519C10.7064 10.1666 10.6346 10.3459 10.4909 10.4896C10.3472 10.6333 10.168 10.7051 9.95324 10.7051ZM16.4116 16.25C16.8325 16.25 17.1888 16.1041 17.4805 15.8125C17.7721 15.5208 17.918 15.1645 17.918 14.7435V5.25642C17.918 4.83547 17.7721 4.47917 17.4805 4.1875C17.1888 3.89583 16.8325 3.75 16.4116 3.75H3.59109C3.17015 3.75 2.81384 3.89583 2.52217 4.1875C2.23051 4.47917 2.08468 4.83547 2.08468 5.25642V14.7435C2.08468 15.1645 2.23051 15.5208 2.52217 15.8125C2.81384 16.1041 3.17015 16.25 3.59109 16.25H16.4116ZM16.4116 15H3.59109C3.5163 15 3.45486 14.9759 3.40678 14.9279C3.3587 14.8798 3.33465 14.8183 3.33465 14.7435V5.25642C3.33465 5.18162 3.3587 5.12019 3.40678 5.0721C3.45486 5.02402 3.5163 4.99998 3.59109 4.99998H16.4116C16.4863 4.99998 16.5478 5.02402 16.5959 5.0721C16.6439 5.12019 16.668 5.18162 16.668 5.25642V14.7435C16.668 14.8183 16.6439 14.8798 16.5959 14.9279C16.5478 14.9759 16.4863 15 16.4116 15ZM9.45647 9.45512V7.08329H5.41797V9.45512H9.45647Z'
export const pinpLeftBottomPath =
    'M9.95324 14.1506H4.9212C4.70645 14.1506 4.52722 14.0788 4.38353 13.9351C4.23983 13.7914 4.16799 13.6122 4.16799 13.3974V10.032C4.16799 9.81729 4.23983 9.63807 4.38353 9.49438C4.52722 9.35068 4.70645 9.27883 4.9212 9.27883H9.95324C10.168 9.27883 10.3472 9.35068 10.4909 9.49438C10.6346 9.63807 10.7064 9.81729 10.7064 10.032V13.3974C10.7064 13.6122 10.6346 13.7914 10.4909 13.9351C10.3472 14.0788 10.168 14.1506 9.95324 14.1506ZM16.4116 16.25C16.8325 16.25 17.1888 16.1041 17.4805 15.8125C17.7721 15.5208 17.918 15.1645 17.918 14.7435V5.25642C17.918 4.83547 17.7721 4.47917 17.4805 4.1875C17.1888 3.89583 16.8325 3.75 16.4116 3.75H3.59109C3.17015 3.75 2.81384 3.89583 2.52217 4.1875C2.23051 4.47917 2.08468 4.83547 2.08468 5.25642V14.7435C2.08468 15.1645 2.23051 15.5208 2.52217 15.8125C2.81384 16.1041 3.17015 16.25 3.59109 16.25H16.4116ZM16.4116 15H3.59109C3.5163 15 3.45486 14.9759 3.40678 14.9279C3.3587 14.8798 3.33465 14.8183 3.33465 14.7435V5.25642C3.33465 5.18162 3.3587 5.12019 3.40678 5.0721C3.45486 5.02402 3.5163 4.99998 3.59109 4.99998H16.4116C16.4863 4.99998 16.5478 5.02402 16.5959 5.0721C16.6439 5.12019 16.668 5.18162 16.668 5.25642V14.7435C16.668 14.8183 16.6439 14.8798 16.5959 14.9279C16.5478 14.9759 16.4863 15 16.4116 15ZM9.45647 12.9006V10.5288H5.41797V12.9006H9.45647Z'
export const pinpRightBottomPath =
    'M10.0468 14.1506H15.0788C15.2936 14.1506 15.4728 14.0788 15.6165 13.9351C15.7602 13.7914 15.832 13.6122 15.832 13.3974V10.032C15.832 9.81729 15.7602 9.63807 15.6165 9.49438C15.4728 9.35068 15.2936 9.27883 15.0788 9.27883H10.0468C9.83201 9.27883 9.65279 9.35068 9.50909 9.49438C9.3654 9.63807 9.29355 9.81729 9.29355 10.032V13.3974C9.29355 13.6122 9.3654 13.7914 9.50909 13.9351C9.65279 14.0788 9.83201 14.1506 10.0468 14.1506ZM3.58845 16.25C3.1675 16.25 2.8112 16.1041 2.51953 15.8125C2.22786 15.5208 2.08203 15.1645 2.08203 14.7435V5.25642C2.08203 4.83547 2.22786 4.47917 2.51953 4.1875C2.8112 3.89583 3.1675 3.75 3.58845 3.75H16.4089C16.8299 3.75 17.1862 3.89583 17.4778 4.1875C17.7695 4.47917 17.9153 4.83547 17.9153 5.25642V14.7435C17.9153 15.1645 17.7695 15.5208 17.4778 15.8125C17.1862 16.1041 16.8299 16.25 16.4089 16.25H3.58845ZM3.58845 15H16.4089C16.4837 15 16.5451 14.9759 16.5932 14.9279C16.6413 14.8798 16.6653 14.8183 16.6653 14.7435V5.25642C16.6653 5.18162 16.6413 5.12019 16.5932 5.0721C16.5451 5.02402 16.4837 4.99998 16.4089 4.99998H3.58845C3.51366 4.99998 3.45222 5.02402 3.40414 5.0721C3.35605 5.12019 3.33201 5.18162 3.33201 5.25642V14.7435C3.33201 14.8183 3.35605 14.8798 3.40414 14.9279C3.45222 14.9759 3.51366 15 3.58845 15ZM10.5435 12.9006V10.5288H14.582V12.9006H10.5435Z'
export const rotatePath =
    'M11.2882 9.02352C10.9957 9.93919 10.4282 10.6167 9.58558 11.0561C8.74299 11.4955 7.86522 11.5694 6.95226 11.2778L6.62168 11.1722L7.00293 11.9113C7.04282 11.9886 7.04928 12.0719 7.02229 12.1611C6.9953 12.2503 6.94135 12.3157 6.86043 12.3575C6.7795 12.3992 6.69534 12.4061 6.60795 12.3782C6.52056 12.3503 6.456 12.2959 6.41426 12.215L5.69557 10.8217C5.64348 10.7207 5.63373 10.6192 5.66632 10.5172C5.69892 10.4151 5.7657 10.3381 5.86668 10.286L7.25995 9.56727C7.33729 9.52737 7.42055 9.52092 7.50973 9.54791C7.59891 9.57489 7.66437 9.62885 7.70611 9.70978C7.74785 9.7907 7.75477 9.87486 7.72686 9.96224C7.69895 10.0496 7.64453 10.1142 7.56361 10.1559L6.82451 10.5372L7.15509 10.6428C7.89057 10.8777 8.59815 10.8184 9.27783 10.4648C9.95752 10.1113 10.416 9.56321 10.6531 8.82068C10.6927 8.69692 10.7236 8.57089 10.7461 8.44257C10.7685 8.31425 10.7785 8.18389 10.7759 8.05148C10.7775 7.95271 10.8076 7.86854 10.866 7.79897C10.9244 7.7294 10.9993 7.6871 11.0909 7.67207C11.1867 7.65843 11.2702 7.68225 11.3413 7.74352C11.4123 7.80479 11.447 7.88482 11.4454 7.98359C11.4508 8.16119 11.4393 8.33726 11.4108 8.51178C11.3823 8.68631 11.3414 8.85689 11.2882 9.02352ZM5.34742 7.17266C5.30789 7.29642 5.27691 7.42246 5.25447 7.55077C5.23203 7.67909 5.2221 7.80945 5.22466 7.94187C5.22302 8.04063 5.19265 8.12589 5.13354 8.19763C5.07444 8.26937 4.99912 8.31275 4.9076 8.32778C4.81606 8.34281 4.73456 8.32037 4.66308 8.26045C4.5916 8.20053 4.55598 8.12336 4.55623 8.02894C4.55214 7.84698 4.56349 7.66772 4.59028 7.49114C4.61707 7.31458 4.65777 7.1408 4.71239 6.96982C5.00486 6.05415 5.57239 5.37661 6.41497 4.93722C7.25755 4.49783 8.13533 4.42394 9.04829 4.71554L9.37887 4.82113L8.99762 4.08204C8.95772 4.0047 8.95127 3.92144 8.97825 3.83226C9.00524 3.74309 9.0592 3.67763 9.14012 3.63589C9.22105 3.59414 9.30521 3.58722 9.3926 3.61513C9.47998 3.64304 9.54454 3.69746 9.58628 3.77839L10.305 5.17167C10.3571 5.27264 10.3668 5.37415 10.3342 5.47619C10.3016 5.57823 10.2348 5.6553 10.1339 5.70738L8.74059 6.42608C8.66325 6.46598 8.57999 6.47243 8.49081 6.44544C8.40163 6.41846 8.33617 6.3645 8.29443 6.28357C8.25269 6.20265 8.24577 6.1185 8.27368 6.03111C8.3016 5.94373 8.35601 5.87916 8.43694 5.83742L9.17603 5.45617L8.84545 5.35058C8.10998 5.11567 7.4024 5.17498 6.72271 5.52853C6.04302 5.88209 5.58459 6.43013 5.34742 7.17266Z'
export const rotateAnchorOffset = 20

export const menuIdCrop = 'crop'
export const menuIdPinp = 'pinp'
export const menuIdFlipHorizontal = 'flipHorizontal'
export const menuIdFlipVertical = 'flipVertical'
export const menuIdBack = 'back'
export const menuIdDone = 'done'
export const menuIdPinpLeftTop = 'pinpLeftTop'
export const menuIdPinpRightTop = 'pinpRightTop'
export const menuIdPinpLeftBottom = 'pinpLeftBottom'
export const menuIdPinpRightBottom = 'pinpRightBottom'

export const anchorIdBackgroundRect = 'backgroundRect'
export const anchorIdTranslationRect = 'translationRect'
export const anchorIdLeftTop = 'leftTop'
export const anchorIdRightTop = 'rightTop'
export const anchorIdLeftBottom = 'leftBottom'
export const anchorIdRightBottom = 'rightBottom'
export const anchorIdTopCenter = 'topCenter'
export const anchorIdBottomCenter = 'bottomCenter'
export const anchorIdLeftCenter = 'leftCenter'
export const anchorIdRightCenter = 'rightCenter'
export const anchorIdRotation = 'rotation'


export const clipMenuPaths = [
    {path: cropPath, id: menuIdCrop},
    {path: pinpPath, id: menuIdPinp},
    {path: flipHorizontal, id: menuIdFlipHorizontal},
    {path: flipVertical, id: menuIdFlipVertical}
]
export const cropMenuPaths = [
    {path: backPath, id: menuIdBack},
    {path: donePath, id: menuIdDone},
]
export const pinpMenuPaths = [
    {path: backPath, id: menuIdBack},
    {path: pinpLeftTopPath, id: menuIdPinpLeftTop},
    {path: pinpRightTopPath, id: menuIdPinpRightTop},
    {path: pinpLeftBottomPath, id: menuIdPinpLeftBottom},
    {path: pinpRightBottomPath, id: menuIdPinpRightBottom},
]

export const anchorWidth = 12
export const anchorHeight = 12
export const rotationAnchorWidth = 16
export const rotationAnchorHeight = 16

export const pinpScale = 1/4

export interface Rect {
    id: string
    x: number
    y: number
    width: number
    height: number
    colorKey: string
}
