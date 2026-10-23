# DBSCAN

**Идея.** Заказы, расположенные плотно, объединяются в группы, а одиночные заказы остаются сами по себе.

## Как работает

1. Для заданного радиуса \(\eta\) заказы кластеризуются алгоритмом DBSCAN с параметром `min_samples = 1`. Каждый заказ считается ядровым, и группы — это связные компоненты графа, в котором заказы соединены, если расстояние между ними не больше \(\eta\). Это эквивалентно кластеризации одиночной связи с жёстким порогом расстояния: шумовых точек нет, каждый заказ попадает в какую-то группу.
2. Если масса группы больше вместимости самого вместительного типа транспорта, группа делится отдельным шагом после DBSCAN: заказы сортируются по расстоянию до склада по возрастанию и жадно раскладываются по «корзинам». Каждая корзина отслеживает наименьший тип транспорта, вмещающий её текущую массу; новая корзина открывается, когда следующий заказ уже не помещается.
3. Каждой итоговой поездке — целой группе или части разделённой — присваивается наименьший тип транспорта, вмещающий её массу.
4. В набор попадают только выполнимые варианты.

## Параметры и разнообразие вариантов

- Радиусы перебираются по кругу: \(\eta \in \{0{,}1;\ 0{,}2;\ 0{,}5;\ 1{,}0;\ 2{,}0\}\) км.
- Первые пять вариантов используют каждый радиус по одному разу на точных координатах.
- Начиная с шестого варианта, перед кластеризацией к координатам добавляется независимый гауссов шум со стандартным отклонением \(0{,}1 \cdot \eta\). Шум влияет только на то, какие заказы окажутся вместе: перед оценкой поездки переносятся обратно на точные координаты.
- Генерация останавливается, когда набрано достаточно выполнимых вариантов, или после фиксированного числа попыток (4N), смотря что наступит раньше.

??? note "Псевдокод"
    ```
    procedure DBSCANPool(orders, depot, N)
        E ← [0.1, 0.2, 0.5, 1.0, 2.0]                  ▷ km
        pool ← ∅; attempt ← 0
        while |pool| < N and attempt < 4N do
            attempt ← attempt + 1
            η ← E[attempt mod |E|]                     ▷ cycle through the grid
            if attempt > |E| then
                coords ← true coordinates + Gaussian noise, std = 0.1η
            else
                coords ← true coordinates
            end if
            groups ← connected components of orders within η, using coords
            bins ← ∅
            for each group g in groups do
                add SplitToFit(g, depot) to bins
            end for
            clustering ← one cluster per bin, typed by its mass, mapped back to true orders
            if clustering is feasible then
                add clustering to pool
            end if
        end while
        return pool
    end procedure

    procedure SplitToFit(g, depot)
        sort g by distance to depot, ascending
        bins ← ∅; current ← ∅; M ← 0
        for each order o in sorted g do
            σ ← smallest courier type with capacity ≥ M + weight(o)
            if M + weight(o) ≤ capacity(σ) then
                add o to current; M ← M + weight(o)
            else
                close current as a bin (if non-empty); current ← {o}; M ← weight(o)
            end if
        end for
        close final current as a bin
        return bins
    end procedure
    ```
