// use rand::prelude::*;
// use rand::Rng;
use rand_distr::{Distribution, Normal};
use wasm_bindgen::prelude::*;
extern crate nalgebra as na;
use na::{Matrix2, Vector2};

#[wasm_bindgen]
pub struct KalmanFilter {
    /// システムモデル行列
    a: Matrix2<f64>,
    /// システムモデルのノイズの分散共分散行列
    q: Matrix2<f64>,
    /// 観測モデルのノイズの分散共分散行列
    r: Matrix2<f64>,
}

#[wasm_bindgen]
impl KalmanFilter {
    fn new(a: Matrix2<f64>, q: Matrix2<f64>, r: Matrix2<f64>) -> Self {
        Self { a, q, r }
    }

    fn estimate(
        &self,
        y: Vector2<f64>,
        x: Vector2<f64>,
        v: Matrix2<f64>,
    ) -> (Vector2<f64>, Matrix2<f64>) {
        // 前回の推定値から今回の値を予測
        let x_next = self.a * x;
        let v_next = self.a * v * self.a.transpose() + self.q;

        // 観測値 更新
        let vr = v_next + self.r;
        let vr_inv = vr.try_inverse().unwrap();
        let k = v_next * vr_inv;
        let x_new = x_next + k * (y - x_next);
        let v_new = (Matrix2::<f64>::identity() - k) * v_next;

        (x_new, v_new)
    }
}
#[wasm_bindgen]
pub struct Simulator {
    /// カルマンフィルタ
    kalman: KalmanFilter,
    /// システムモデル行列
    a: Matrix2<f64>,
    /// 真値ベクトル
    z: Vector2<f64>,
    /// 推定値ベクトル
    x: Vector2<f64>,
    /// 観測値ベクトル
    y: Vector2<f64>,
    // 推定誤差分散共分散マトリクス
    v: Matrix2<f64>,
}

#[wasm_bindgen]
impl Simulator {
    pub fn new() -> Self {
        use std::f64::consts::PI;
        // 1tickあたり7 [deg]回転する
        let t = PI / 180.0 * 1.0;

        // 回転行列をシステムモデル行列として用いる
        let a = Matrix2::new(t.cos(), -t.sin(), t.sin(), t.cos());
        let q = Matrix2::<f64>::identity();
        let r = Matrix2::<f64>::identity() * 50.0;

        let kalman = KalmanFilter::new(a, q, r);
        let z = Vector2::new(1., 0.);
        let x = Vector2::new(1., 0.);
        let y = Vector2::new(1., 0.);
        let v = Matrix2::<f64>::identity();

        Self {
            kalman,
            a,
            z,
            x,
            y,
            v,
        }
    }

    pub fn tick(&mut self) {
        // 真値を生成
        self.z = self.a * self.z;

        // ノイズ生成
        let mut rng = rand::thread_rng();
        let normal = Normal::new(0.0, 0.15).unwrap();
        let s = normal.sample(&mut rng);

        let t = self.x[1].atan2(self.x[0]);
        let n = Vector2::new(s * t.cos(), s * t.sin());
        // 真値から観測値を生成
        self.y = self.z + n;

        // 観測値と前回の推定値から今回の推定値を計算
        let res = self.kalman.estimate(self.y, self.x, self.v);

        // 推定値を更新
        self.x = res.0;
        self.v = res.1;
    }

    pub fn true_value(&self) -> *const f64 {
        self.z.as_ptr()
    }

    pub fn observed_value(&self) -> *const f64 {
        self.y.as_ptr()
    }

    pub fn estimated_value(&self) -> *const f64 {
        self.x.as_ptr()
    }
}
