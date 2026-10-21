#version 300 es
precision highp float;

in vec3 vNormal;
in vec3 vWorldPos;
in vec2 vUV;

uniform vec3 uTint;
uniform bool uShowUV;
uniform bool uUseTex;
uniform sampler2D uTex;

out vec4 outColor;

void main() {
    vec3 n = normalize(vNormal);
    vec3 lightDir = normalize(vec3(0.4, 0.8, 0.5));
    float diff = max(dot(n, lightDir), 0.0);

    vec3 baseColor = uTint;
    float alpha = 1.0;

    if (uUseTex) {
        vec4 texSample = texture(uTex, vUV);
        // Discard unpainted / transparent pixels so they don't render black or block the z-buffer
        if (texSample.a < 0.1) discard;
        baseColor = texSample.rgb * uTint;
        alpha = texSample.a;
    }

    // Apply directional shading to both textured and pure-color untextured models
    vec3 col = baseColor * (0.45 + 0.55 * diff);

    if (uShowUV) {
        vec2 c = floor(vUV * 8.0);
        col = mix(vec3(0.15), vec3(0.95), mod(c.x + c.y, 2.0));
    }

    outColor = vec4(col, alpha);
}