// Freestanding WebAssembly kernel. From the repository root:
// zig cc -target wasm32-freestanding -O3 -ffast-math -fno-builtin -nostdlib
//   -Wl,--no-entry -Wl,--export-dynamic -Wl,--export=__heap_base
//   -Wl,--export-memory tools/taku/raster.c -o
//   research/part-2/assets/taku-raster.wasm
typedef unsigned int U32;
typedef unsigned short U16;
typedef unsigned char U8;
#define EXPORT __attribute__((visibility("default")))
#define NEAR .009f
static float minimum(float a, float b) { return __builtin_fminf(a, b); }
static float maximum(float a, float b) { return __builtin_fmaxf(a, b); }
static int limit(int v, int a, int b) { return v < a ? a : v > b ? b : v; }
static U32 rgb(float r, float g, float b) {
  return 0xff000000u | ((U32)b << 16) | ((U32)g << 8) | (U32)r;
}
static float dot(float x, float y, float z, const float *v) {
  return x * v[0] + y * v[1] + z * v[2];
}
typedef struct {
  float x, y, z, r, g, b, u, v;
} Vertex;
typedef struct {
  float x, y, z, nx, ny, nz, u, v;
} Source;
typedef struct {
  float pos[3], right[3], up[3], eye[3], focal;
} Camera;
static int width, height, inkSize;
static U32 *pixels;
static float *depths;
static U16 *surface;
static U8 *ink;
static Camera camera;
EXPORT void frame(int w, int h, U32 *output, float *depth, U16 *part, U8 *print,
                  int printWidth, const Camera *pose) {
  width = w;
  height = h;
  pixels = output;
  depths = depth;
  surface = part;
  ink = print;
  inkSize = printWidth;
  camera = *pose;
}
static void fill(const Vertex a, const Vertex b, const Vertex c, U16 tag,
                 int printed) {
  float dx1 = b.x - a.x, dx2 = c.x - a.x, dy1 = b.y - a.y, dy2 = c.y - a.y,
        det = dx1 * dy2 - dx2 * dy1;
  if (__builtin_fabsf(det) < .00001f)
    return;
  int x0 =
      (int)maximum(0, __builtin_ceilf(minimum(a.x, minimum(b.x, c.x)) - .5f));
  int x1 = (int)minimum(
      width - 1, __builtin_floorf(maximum(a.x, maximum(b.x, c.x)) - .5f));
  int y0 =
      (int)maximum(0, __builtin_ceilf(minimum(a.y, minimum(b.y, c.y)) - .5f));
  int y1 = (int)minimum(
      height - 1, __builtin_floorf(maximum(a.y, maximum(b.y, c.y)) - .5f));
  if (x0 > x1 || y0 > y1)
    return;
  float inv = 1.f / det, ux = dy2 * inv, vx = -dy1 * inv, uy = -dx2 * inv,
        vy = dx1 * inv, wx = -ux - vx;
  float zu = b.z - a.z, zv = c.z - a.z, ru = b.r - a.r, rv = c.r - a.r,
        gu = b.g - a.g, gv = c.g - a.g, bu = b.b - a.b, bv = c.b - a.b;
  float iz = zu * ux + zv * vx, ir = ru * ux + rv * vx, ig = gu * ux + gv * vx,
        ib = bu * ux + bv * vx;
  float dx = x0 + .5f - a.x;
  for (int y = y0; y <= y1; y++) {
    float u = dx * ux + (y + .5f - a.y) * uy,
          v = dx * vx + (y + .5f - a.y) * vy, w = 1.f - u - v;
    int l = 0, h = x1 - x0;
// Intersect one scanline with each barycentric half-plane.
#define BOUND(value, step)                                                     \
  if (step > 0) {                                                              \
    int n = (int)__builtin_ceilf(-(value) / (step));                           \
    if (n > l)                                                                 \
      l = n;                                                                   \
  } else if (step < 0) {                                                       \
    int n = (int)__builtin_floorf(-(value) / (step));                          \
    if (n < h)                                                                 \
      h = n;                                                                   \
  } else if (value < 0)                                                        \
    continue;
    BOUND(u, ux)
    BOUND(v, vx) BOUND(w, wx)
#undef BOUND
        if (l > h) continue;
    u += l * ux;
    v += l * vx;
    int index = y * width + x0 + l, end = index + h - l;
    float z = a.z + zu * u + zv * v, r = a.r + ru * u + rv * v,
          g = a.g + gu * u + gv * v, blue = a.b + bu * u + bv * v;
    if (printed) {
      float tu =
          (a.u + u * (b.u - a.u) + v * (c.u - a.u)) * (inkSize - 1) / 255.f;
      float tv =
          (a.v + u * (b.v - a.v) + v * (c.v - a.v)) * (inkSize - 1) / 255.f;
      float du = ((b.u - a.u) * ux + (c.u - a.u) * vx) * (inkSize - 1) / 255.f;
      float dv = ((b.v - a.v) * ux + (c.v - a.v) * vx) * (inkSize - 1) / 255.f;
      for (; index <= end;
           index++, z += iz, r += ir, g += ig, blue += ib, tu += du, tv += dv) {
        if (z + .00045f < depths[index] ||
            ink[limit((int)(tv + .5f), 0, inkSize - 1) * inkSize +
                limit((int)(tu + .5f), 0, inkSize - 1)] < 25)
          continue;
        pixels[index] = rgb(r, g, blue);
        depths[index] = z;
        surface[index] = tag;
      }
    } else
      for (; index <= end; index++, z += iz, r += ir, g += ig, blue += ib) {
        if (z < depths[index])
          continue;
        pixels[index] = rgb(r, g, blue);
        depths[index] = z;
        surface[index] = tag;
      }
  }
}
static Vertex cut(const Source a, const Source b, Vertex left, Vertex right,
                  float za, float zb) {
  float t = (NEAR - za) / (zb - za), x = a.x + t * (b.x - a.x) - camera.pos[0],
        y = a.y + t * (b.y - a.y) - camera.pos[1],
        z = a.z + t * (b.z - a.z) - camera.pos[2];
  return (Vertex){width * .5f +
                      camera.focal * dot(x, y, z, camera.right) / NEAR,
                  height * .5f - camera.focal * dot(x, y, z, camera.up) / NEAR,
                  1.f / NEAR,
                  left.r + t * (right.r - left.r),
                  left.g + t * (right.g - left.g),
                  left.b + t * (right.b - left.b),
                  left.u + t * (right.u - left.u),
                  left.v + t * (right.v - left.v)};
}
EXPORT void mesh(const Source *src, int count, const U16 *indices, int n,
                 Vertex *screen, const U32 *finish, U16 tag, int printed) {
  for (int i = 0; i < count; i++) {
    Source s = src[i];
    float x = s.x - camera.pos[0], y = s.y - camera.pos[1],
          z = s.z - camera.pos[2], d = -dot(x, y, z, camera.eye);
    float inv = 1.f / d, f = dot(s.nx, s.ny, s.nz, camera.eye),
          k = (f < 0 ? -38.f : 38.f) / (1.f + __builtin_fabsf(f));
    int tx =
            limit((int)(40.f + k * dot(s.nx, s.ny, s.nz, camera.right)), 0, 79),
        ty = limit((int)(40.f + k * dot(s.nx, s.ny, s.nz, camera.up)), 0, 79);
    U32 color = finish[ty * 80 + tx];
    screen[i] =
        (Vertex){width * .5f + camera.focal * dot(x, y, z, camera.right) * inv,
                 height * .5f - camera.focal * dot(x, y, z, camera.up) * inv,
                 inv,
                 color & 255,
                 (color >> 8) & 255,
                 (color >> 16) & 255,
                 s.u,
                 s.v};
  }
  for (int i = 0; i < n; i += 3) {
    U16 a = indices[i], b = indices[i + 1], c = indices[i + 2];
    float za = screen[a].z, zb = screen[b].z, zc = screen[c].z;
    if (za > 0 && za < 1.f / NEAR && zb > 0 && zb < 1.f / NEAR && zc > 0 &&
        zc < 1.f / NEAR) {
      fill(screen[a], screen[b], screen[c], tag, printed);
      continue;
    }
    if ((za <= 0 || za >= 1.f / NEAR) && (zb <= 0 || zb >= 1.f / NEAR) &&
        (zc <= 0 || zc >= 1.f / NEAR))
      continue;
    U16 ix[3] = {a, b, c};
    Vertex clipped[4];
    int length = 0;
    for (int k = 0; k < 3; k++) {
      U16 a = ix[(k + 2) % 3], b = ix[k];
      float da = 1.f / screen[a].z, db = 1.f / screen[b].z;
      if ((da >= NEAR) != (db >= NEAR))
        clipped[length++] = cut(src[a], src[b], screen[a], screen[b], da, db);
      if (db >= NEAR)
        clipped[length++] = screen[b];
    }
    for (int k = 1; k + 1 < length; k++)
      fill(clipped[0], clipped[k], clipped[k + 1], tag, printed);
  }
}
EXPORT int outline(int selected, int s, float px, float py) {
  int d = s * width, wide = 2 * s, dd = d * 2, best = -1;
  float closest = 1e20f;
  for (int y = wide; y < height - wide; y++)
    for (int x = wide, i = y * width + wide; x < width - wide; x++, i++) {
      int on = (surface[i] & 31) == selected;
      if (on) {
        float dx = x - px, dy = y - py, distance = dx * dx + dy * dy;
        if (distance < closest) {
          closest = distance;
          best = i;
        }
        if ((surface[i - s] & 31) != selected ||
            (surface[i + s] & 31) != selected ||
            (surface[i - d] & 31) != selected ||
            (surface[i + d] & 31) != selected)
          pixels[i] =
              (pixels[i] & 255) > 177 ? rgb(131, 64, 36) : rgb(244, 182, 116);
      } else if ((surface[i - s] & 31) == selected ||
                 (surface[i + s] & 31) == selected ||
                 (surface[i - d] & 31) == selected ||
                 (surface[i + d] & 31) == selected)
        pixels[i] = rgb(54, 47, 40);
      else if ((surface[i - wide] & 31) == selected ||
               (surface[i + wide] & 31) == selected ||
               (surface[i - dd] & 31) == selected ||
               (surface[i + dd] & 31) == selected)
        pixels[i] = rgb(174, 99, 60);
    }
  return best;
}
