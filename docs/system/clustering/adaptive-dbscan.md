# Adaptive DBSCAN

**Идея.** Как и DBSCAN, алгоритм группирует заказы по близости, но радиус соседства растёт с расстоянием заказа от склада. Дальние заказы естественным образом расположены реже, а обслуживать их поодиночке дороже, поэтому их легче объединять в группы.

Радиус для заказа o:

$$
\eta(o) = base \cdot (1 + scale \cdot d(\text{склад}, o))
$$

## Как работает

Готовая библиотека кластеризации не используется: расширение групп реализовано напрямую, поиском в ширину.

1. Заказы перемешиваются в случайном порядке, своём для каждого варианта.
2. Каждый ещё не посещённый заказ в этом порядке открывает новую группу.
3. Группа расширяется на заказы, до которых можно «дотянуться». Каждый принятый заказ добавляет в дальнейший поиск свой радиус, поэтому область поиска меняется по мере роста группы, а не задаётся только первым заказом.
4. Соседний заказ принимается, только если масса группы не превысит вместимость наименьшего типа транспорта, способного её увезти. Не прошедший проверку заказ остаётся непосещённым и позже может открыть свою группу.
5. В итоге каждый заказ оказывается либо в группе, либо отдельной поездкой из одного заказа. Типы транспорта присваиваются по массе так же, как в [DBSCAN](dbscan.md).

## Параметры и разнообразие вариантов

Набор вариантов создаётся тем же механизмом, что и для [DBSCAN](dbscan.md): сетка из четырёх значений base и четырёх значений scale и столько вариантов случайного порядка, чтобы сетка примерно покрыла нужный размер набора. Комбинации перебираются по кругу; когда сетка исчерпана, к координатам добавляется шум.

??? note "Псевдокод"
    ```
    procedure AdaptiveDBSCAN(orders, depot, base, scale, seed)
        shuffle orders using seed
        η(o) ← base · (1 + scale · d(depot, o))       ▷ per-order radius
        visited ← ∅; clusters ← ∅
        for each order p in shuffled orders do
            if p ∈ visited then
                continue
            end if
            visited ← visited ∪ {p}
            C ← new cluster seeded with p
            queue ← orders within η(p) of p
            while queue not empty do
                q ← pop queue
                if q ∈ visited then
                    continue
                end if
                M ← mass(C) + weight(q)
                σ ← smallest courier type with capacity ≥ M
                if M > capacity(σ) then
                    continue                          ▷ q stays unvisited; may seed its own cluster
                end if
                visited ← visited ∪ {q}; add q to C
                add unvisited orders within η(q) of q to queue
            end while
            add C to clusters
        end for
        return clusters                               ▷ typed by mass, as in SplitToFit
    end procedure
    ```
